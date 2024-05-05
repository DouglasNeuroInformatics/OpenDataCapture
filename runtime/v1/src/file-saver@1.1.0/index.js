/* eslint-disable */
// @ts-nocheck

//***** FileSaver.js ver. 1.1.20160328 *****************************************
/*! http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js ******/

/**
 * Modified on May 2 2024 for legacy interop in ESM environment
 */

export const saveAs = (function () {
  'use strict';
  // IE <10 is explicitly unsupported
  if (typeof navigator !== 'undefined' && /MSIE [1-9]\./.test(navigator.userAgent)) {
    return;
  }
  var doc = window.document,
    // only get URL when necessary in case Blob.js hasn't overridden it yet
    get_URL = function () {
      return window.URL || window.webkitURL || window;
    },
    save_link = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
    can_use_save_link = 'download' in save_link,
    click = function (node) {
      var event = new MouseEvent('click');
      node.dispatchEvent(event);
    },
    is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent),
    webkit_req_fs = window.webkitRequestFileSystem,
    req_fs = window.requestFileSystem || webkit_req_fs || window.mozRequestFileSystem,
    throw_outside = function (ex) {
      (window.setImmediate || window.setTimeout)(function () {
        throw ex;
      }, 0);
    },
    force_saveable_type = 'application/octet-stream',
    fs_min_size = 0,
    // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
    arbitrary_revoke_timeout = 1000 * 40, // in ms
    revoke = function (file) {
      var revoker = function () {
        if (typeof file === 'string') {
          // file is an object URL
          get_URL().revokeObjectURL(file);
        } else {
          // file is a File
          file.remove();
        }
      };
      /* // Take note W3C:
                 var
                 uri = typeof file === "string" ? file : file.toURL()
                 , revoker = function(evt) {
                 // idealy DownloadFinishedEvent.data would be the URL requested
                 if (evt.data === uri) {
                 if (typeof file === "string") { // file is an object URL
                 get_URL().revokeObjectURL(file);
                 } else { // file is a File
                 file.remove();
                 }
                 }
                 }
                 ;
                 window.addEventListener("downloadfinished", revoker);
                 */
      setTimeout(revoker, arbitrary_revoke_timeout);
    },
    dispatch = function (filesaver, event_types, event) {
      event_types = [].concat(event_types);
      var i = event_types.length;
      while (i--) {
        var listener = filesaver['on' + event_types[i]];
        if (typeof listener === 'function') {
          try {
            listener.call(filesaver, event || filesaver);
          } catch (ex) {
            throw_outside(ex);
          }
        }
      }
    },
    auto_bom = function (blob) {
      // prepend BOM for UTF-8 XML and text/* types (including HTML)
      if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob(['\ufeff', blob], { type: blob.type });
      }
      return blob;
    },
    FileSaver = function (blob, name, no_auto_bom) {
      if (!no_auto_bom) {
        blob = auto_bom(blob);
      }
      // First try a.download, then web filesystem, then object URLs
      var filesaver = this,
        type = blob.type,
        blob_changed = false,
        object_url,
        target_view,
        dispatch_all = function () {
          dispatch(filesaver, 'writestart progress write writeend'.split(' '));
        },
        // on any filesys errors revert to saving with object URLs
        fs_error = function () {
          if (target_view && is_safari && typeof FileReader !== 'undefined') {
            // Safari doesn't allow downloading of blob urls
            var reader = new FileReader();
            reader.onloadend = function () {
              var base64Data = reader.result;
              target_view.location.href = 'data:attachment/file' + base64Data.slice(base64Data.search(/[,;]/));
              filesaver.readyState = filesaver.DONE;
              dispatch_all();
            };
            reader.readAsDataURL(blob);
            filesaver.readyState = filesaver.INIT;
            return;
          }
          // don't create more object URLs than needed
          if (blob_changed || !object_url) {
            object_url = get_URL().createObjectURL(blob);
          }
          if (target_view) {
            target_view.location.href = object_url;
          } else {
            var new_tab = window.open(object_url, '_blank');
            if (new_tab === undefined && is_safari) {
              //Apple do not allow window.open, see http://bit.ly/1kZffRI
              window.location.href = object_url;
            }
          }
          filesaver.readyState = filesaver.DONE;
          dispatch_all();
          revoke(object_url);
        },
        abortable = function (func) {
          return function () {
            if (filesaver.readyState !== filesaver.DONE) {
              return func.apply(this, arguments);
            }
          };
        },
        create_if_not_found = { create: true, exclusive: false },
        slice;
      filesaver.readyState = filesaver.INIT;
      if (!name) {
        name = 'download';
      }
      if (can_use_save_link) {
        object_url = get_URL().createObjectURL(blob);
        setTimeout(function () {
          save_link.href = object_url;
          save_link.download = name;
          click(save_link);
          dispatch_all();
          revoke(object_url);
          filesaver.readyState = filesaver.DONE;
        });
        return;
      }
      // Object and web filesystem URLs have a problem saving in Google Chrome when
      // viewed in a tab, so I force save with application/octet-stream
      // http://code.google.com/p/chromium/issues/detail?id=91158
      // Update: Google errantly closed 91158, I submitted it again:
      // https://code.google.com/p/chromium/issues/detail?id=389642
      if (window.chrome && type && type !== force_saveable_type) {
        slice = blob.slice || blob.webkitSlice;
        blob = slice.call(blob, 0, blob.size, force_saveable_type);
        blob_changed = true;
      }
      // Since I can't be sure that the guessed media type will trigger a download
      // in WebKit, I append .download to the filename.
      // https://bugs.webkit.org/show_bug.cgi?id=65440
      if (webkit_req_fs && name !== 'download') {
        name += '.download';
      }
      if (type === force_saveable_type || webkit_req_fs) {
        target_view = view;
      }
      if (!req_fs) {
        fs_error();
        return;
      }
      fs_min_size += blob.size;
      req_fs(
        window.TEMPORARY,
        fs_min_size,
        abortable(function (fs) {
          fs.root.getDirectory(
            'saved',
            create_if_not_found,
            abortable(function (dir) {
              var save = function () {
                dir.getFile(
                  name,
                  create_if_not_found,
                  abortable(function (file) {
                    file.createWriter(
                      abortable(function (writer) {
                        writer.onwriteend = function (event) {
                          target_view.location.href = file.toURL();
                          filesaver.readyState = filesaver.DONE;
                          dispatch(filesaver, 'writeend', event);
                          revoke(file);
                        };
                        writer.onerror = function () {
                          var error = writer.error;
                          if (error.code !== error.ABORT_ERR) {
                            fs_error();
                          }
                        };
                        'writestart progress write abort'.split(' ').forEach(function (event) {
                          writer['on' + event] = filesaver['on' + event];
                        });
                        writer.write(blob);
                        filesaver.abort = function () {
                          writer.abort();
                          filesaver.readyState = filesaver.DONE;
                        };
                        filesaver.readyState = filesaver.WRITING;
                      }),
                      fs_error
                    );
                  }),
                  fs_error
                );
              };
              dir.getFile(
                name,
                { create: false },
                abortable(function (file) {
                  // delete file if it already exists
                  file.remove();
                  save();
                }),
                abortable(function (ex) {
                  if (ex.code === ex.NOT_FOUND_ERR) {
                    save();
                  } else {
                    fs_error();
                  }
                })
              );
            }),
            fs_error
          );
        }),
        fs_error
      );
    },
    FS_proto = FileSaver.prototype,
    saveAs = function (blob, name, no_auto_bom) {
      return new FileSaver(blob, name, no_auto_bom);
    };
  // IE 10+ (native saveAs)
  if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
    return function (blob, name, no_auto_bom) {
      if (!no_auto_bom) {
        blob = auto_bom(blob);
      }
      return navigator.msSaveOrOpenBlob(blob, name || 'download');
    };
  }

  FS_proto.abort = function () {
    var filesaver = this;
    filesaver.readyState = filesaver.DONE;
    dispatch(filesaver, 'abort');
  };
  FS_proto.readyState = FS_proto.INIT = 0;
  FS_proto.WRITING = 1;
  FS_proto.DONE = 2;

  FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
      null;

  return saveAs;
})();

//***** SaveTextAs ver. 2014-06-24 *********************************************
//***** https://github.com/ChenWenBrian/FileSaver.js ***************************

if (!String.prototype.endsWithAny) {
  String.prototype.endsWithAny = function () {
    console.warn('WARNING: Using non-standard method on String.prototype added by legacy library!');
    var strArray = Array.prototype.slice.call(arguments),
      $this = this.toLowerCase().toString();
    for (var i = 0; i < strArray.length; i++) {
      if ($this.indexOf(strArray[i], $this.length - strArray[i].length) !== -1) return true;
    }
    return false;
  };
}

export const saveTextAs = function (textContent, fileName, charset) {
  fileName = fileName || 'download.txt';
  charset = charset || 'utf-8';
  textContent = (textContent || '').replace(/\r?\n/g, '\r\n');
  if (saveAs && Blob) {
    var blob = new Blob([textContent], { type: 'text/plain;charset=' + charset });
    saveAs(blob, fileName);
    return true;
  } else {
    //IE9-
    var saveTxtWindow = window.frames.saveTxtWindow;
    if (!saveTxtWindow) {
      saveTxtWindow = document.createElement('iframe');
      saveTxtWindow.id = 'saveTxtWindow';
      saveTxtWindow.style.display = 'none';
      document.body.insertBefore(saveTxtWindow, null);
      saveTxtWindow = window.frames.saveTxtWindow;
      if (!saveTxtWindow) {
        saveTxtWindow = window.open('', '_temp', 'width=100,height=100');
        if (!saveTxtWindow) {
          window.alert('Sorry, download file could not be created.');
          return false;
        }
      }
    }

    var doc = saveTxtWindow.document;
    doc.open('text/plain', 'replace');
    doc.charset = charset;
    if (fileName.endsWithAny('.htm', '.html')) {
      doc.close();
      doc.body.innerHTML = '\r\n' + textContent + '\r\n';
    } else {
      if (!fileName.endsWithAny('.txt')) fileName += '.txt';
      doc.write(textContent);
      doc.close();
    }

    var retValue = doc.execCommand('SaveAs', null, fileName);
    saveTxtWindow.close();
    return retValue;
  }
};
