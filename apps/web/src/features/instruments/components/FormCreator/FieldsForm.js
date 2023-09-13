var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
/* eslint-disable no-alert */
import React, { useContext } from 'react';
import { Form, StepperContext, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
export var FieldsForm = function (_a) {
  var onSubmit = _a.onSubmit;
  var updateIndex = useContext(StepperContext).updateIndex;
  var notifications = useNotificationsStore();
  var t = useTranslation().t;
  var handleSubmit = function (data) {
    var fieldNames = [];
    var formattedFields;
    try {
      formattedFields = data.fields.map(function (_a) {
        var options = _a.options,
          name = _a.name,
          rest = __rest(_a, ['options', 'name']);
        if (fieldNames.includes(name)) {
          throw new Error(''.concat(t('instruments.createInstrument.errors.duplicateField'), ": '").concat(name, "'"));
        }
        fieldNames.push(name);
        if (options === undefined) {
          return __assign(__assign({}, rest), { name: name, options: options });
        }
        var formattedOptions = Object.fromEntries(
          options
            .split('\n')
            .filter(function (s) {
              return s;
            })
            .map(function (option) {
              var items = option.split(':').map(function (item) {
                return item.trim();
              });
              if (items.length !== 2) {
                throw new Error(
                  ''.concat(t('instruments.createInstrument.errors.invalidOptionFormat'), ": '").concat(option, "'")
                );
              }
              return [items[0], items[1]];
            })
        );
        return __assign(__assign({}, rest), { name: name, options: formattedOptions });
      });
    } catch (error) {
      if (error instanceof Error) {
        notifications.addNotification({ type: 'error', message: error.message });
      }
      console.error(error);
      return;
    }
    onSubmit(__assign(__assign({}, data), { fields: formattedFields }));
    updateIndex('increment');
  };
  return React.createElement(Form, {
    content: {
      fields: {
        kind: 'array',
        label: 'Field',
        fieldset: {
          name: {
            kind: 'text',
            label: 'Name',
            variant: 'short'
          },
          kind: {
            kind: 'options',
            label: 'Kind',
            options: {
              text: 'Text',
              numeric: 'Numeric',
              options: 'Options',
              date: 'Date',
              binary: 'Binary'
            }
          },
          label: {
            kind: 'text',
            label: 'Label',
            variant: 'short'
          },
          description: {
            kind: 'text',
            label: 'Description',
            variant: 'short'
          },
          variant: function (_a) {
            var kind = _a.kind;
            var base = { kind: 'options', label: 'Variant' };
            switch (kind) {
              case 'numeric':
                return __assign(__assign({}, base), {
                  options: {
                    default: 'Default',
                    slider: 'Slider'
                  }
                });
              case 'text':
                return __assign(__assign({}, base), {
                  options: {
                    short: 'Short',
                    long: 'Long',
                    password: 'Password'
                  }
                });
              default:
                return null;
            }
          },
          options: function (_a) {
            var kind = _a.kind;
            return kind === 'options'
              ? {
                  description: 'Please enter options in the format {KEY}:{LABEL}, separated by newlines',
                  kind: 'text',
                  label: 'Options',
                  variant: 'long'
                }
              : null;
          },
          min: function (_a) {
            var kind = _a.kind;
            return kind === 'numeric'
              ? {
                  kind: 'numeric',
                  label: 'Minimum Value',
                  variant: 'default',
                  min: 0,
                  max: Number.MAX_SAFE_INTEGER
                }
              : null;
          },
          max: function (_a) {
            var kind = _a.kind;
            return kind === 'numeric'
              ? {
                  kind: 'numeric',
                  label: 'Maximum Value',
                  variant: 'default',
                  min: 0,
                  max: Number.MAX_SAFE_INTEGER
                }
              : null;
          }
        }
      }
    },
    validationSchema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              kind: {
                type: 'string',
                enum: ['binary', 'date', 'numeric', 'options', 'text']
              },
              name: {
                type: 'string',
                pattern: /^\S+$/.source,
                minLength: 1
              },
              label: {
                type: 'string',
                minLength: 1
              },
              description: {
                type: 'string',
                minLength: 1,
                nullable: true
              },
              variant: {
                type: 'string',
                nullable: true
              },
              options: {
                type: 'string',
                nullable: true
              },
              min: {
                type: 'number',
                nullable: true
              },
              max: {
                type: 'number',
                nullable: true
              }
            },
            required: ['kind', 'name', 'label'],
            allOf: [
              {
                if: {
                  properties: {
                    kind: {
                      const: 'text'
                    }
                  }
                },
                then: {
                  properties: {
                    variant: {
                      type: 'string',
                      enum: ['short', 'long', 'password']
                    }
                  }
                }
              },
              {
                if: {
                  properties: {
                    kind: {
                      const: 'options'
                    }
                  }
                },
                then: {
                  properties: {
                    options: {
                      type: 'string',
                      minLength: 1,
                      nullable: false
                    }
                  }
                }
              },
              {
                if: {
                  properties: {
                    kind: {
                      const: 'numeric'
                    }
                  }
                },
                then: {
                  properties: {
                    variant: {
                      type: 'string',
                      enum: ['default', 'slider']
                    },
                    min: {
                      type: 'number',
                      minimum: 0,
                      maximum: Number.MAX_SAFE_INTEGER,
                      nullable: false
                    },
                    max: {
                      type: 'number',
                      minimum: 0,
                      maximum: Number.MAX_SAFE_INTEGER,
                      nullable: false
                    }
                  }
                }
              }
            ]
          }
        }
      },
      required: ['fields']
    },
    onSubmit: handleSubmit
  });
};
