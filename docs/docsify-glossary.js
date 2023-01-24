/*!
 * @stijn-dejongh/docsify-glossary
 * v1.0.0
 * https://github.com/stijn-dejongh/docsify-glossary#readme
 * (c) 2018-2022 Stijn Dejongh
 * Apache-2.0 license
 */
this["@stijn-dejongh/docsify-glossary"] = this["@stijn-dejongh/docsify-glossary"] || {};

this["@stijn-dejongh/docsify-glossary"].js = function(exports) {
    "use strict";
    function replaceTermInLine(term, contentLine, linkId, config) {
        if (isTitle(contentLine) && !config.replaceTitleTerms) {
            return contentLine;
        }
        var re = new RegExp("\\s(".concat(term, ")[\\s$]"), "ig");
        var reComma = new RegExp("\\s(".concat(term, "),"), "ig");
        var reFullStop = new RegExp("\\s(".concat(term, ")\\."), "ig");
        var link = " [$1](/".concat(config.glossaryLocation.replace(".md", ""), "?id=").concat(linkId, ")");
        var replacement = contentLine.replace(reComma, link + ",").replace(re, link + " ").replace(reFullStop, link + ".");
        return isTitle(contentLine) ? replacement.replaceAll("[".concat(term, "]"), "[ ".concat(term, "]")) : replacement;
    }
    function isTitle(line) {
        return line.trim().startsWith("#");
    }
    function replaceTerm(content, term, linkId, config) {
        var processedText = "";
        var codeBlockContext = false;
        content.split("\n").forEach((function(line, _index) {
            if (line.trim().startsWith("```")) {
                codeBlockContext = !codeBlockContext;
            }
            var replacedLine = line;
            if (line.trim().length > 0 && !codeBlockContext) {
                replacedLine = replaceTermInLine(term, line + " ", linkId, config).trimEnd();
            }
            processedText += replacedLine + "\n";
        }));
        return processedText;
    }
    function addLinks(content, terms, config) {
        var textWithReplacements = content;
        if (config.debug) {
            console.log("Adding links for terminology: ".concat(terms));
        }
        for (var term in terms) {
            textWithReplacements = replaceTerm(textWithReplacements, term, terms[term], config);
        }
        return textWithReplacements;
    }
    function loadTerminology(text, configuration) {
        var lines = text.split("\n");
        var dictionary = {};
        lines.forEach((function(line) {
            if (line.trimStart().startsWith(configuration.terminologyHeading)) {
                var term = line.replace(configuration.terminologyHeading, "").trim();
                if (configuration.debug) {
                    console.log("detected glossary term: ".concat(term));
                }
                dictionary[term] = term.toLowerCase().replace(" ", "-");
            }
        }));
        return dictionary;
    }
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            enumerableOnly && (symbols = symbols.filter((function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            }))), keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = null != arguments[i] ? arguments[i] : {};
            i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
                _defineProperty(target, key, source[key]);
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            }));
        }
        return target;
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
            writable: false
        });
        return Constructor;
    }
    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    }
    var DEFAULT_TERM_HEADING = "#####";
    var DEFAULT_GLOSSARY_FILE_NAME = "_glossary.md";
    var GlossaryConfigurationBuilder = function() {
        function GlossaryConfigurationBuilder() {
            _classCallCheck(this, GlossaryConfigurationBuilder);
            _defineProperty(this, "terminologyHeading", "");
            _defineProperty(this, "glossaryLocation", "");
            _defineProperty(this, "debug", false);
            _defineProperty(this, "replaceTitleTerms", true);
            this.terminologyHeading = DEFAULT_TERM_HEADING;
            this.glossaryLocation = DEFAULT_GLOSSARY_FILE_NAME;
        }
        _createClass(GlossaryConfigurationBuilder, [ {
            key: "withTermHeading",
            value: function withTermHeading(heading) {
                this.terminologyHeading = heading;
                return this;
            }
        }, {
            key: "withGlossaryLocation",
            value: function withGlossaryLocation(glossaryLocation) {
                this.glossaryLocation = glossaryLocation;
                return this;
            }
        }, {
            key: "withDebugEnabled",
            value: function withDebugEnabled(enableDebug) {
                this.debug = enableDebug;
                return this;
            }
        }, {
            key: "withTitleTermReplacement",
            value: function withTitleTermReplacement(enableTitleTermReplacement) {
                this.replaceTitleTerms = enableTitleTermReplacement;
                return this;
            }
        }, {
            key: "build",
            value: function build() {
                return _objectSpread2({}, this);
            }
        } ]);
        return GlossaryConfigurationBuilder;
    }();
    function configFromYaml(configurationYaml) {
        var _configurationYaml$te, _configurationYaml$gl, _configurationYaml$de, _configurationYaml$re;
        return (new GlossaryConfigurationBuilder).withTermHeading((_configurationYaml$te = configurationYaml.terminologyHeading) !== null && _configurationYaml$te !== void 0 ? _configurationYaml$te : DEFAULT_TERM_HEADING).withGlossaryLocation((_configurationYaml$gl = configurationYaml.glossaryLocation) !== null && _configurationYaml$gl !== void 0 ? _configurationYaml$gl : DEFAULT_GLOSSARY_FILE_NAME).withDebugEnabled((_configurationYaml$de = configurationYaml.debug) !== null && _configurationYaml$de !== void 0 ? _configurationYaml$de : false).withTitleTermReplacement((_configurationYaml$re = configurationYaml.replaceTitleTerms) !== null && _configurationYaml$re !== void 0 ? _configurationYaml$re : true).build();
    }
    function defaultGlossifyConfig() {
        return (new GlossaryConfigurationBuilder).build();
    }
    function injectTerminologyInContent(content, configuration, next) {
        content = addLinks(content, window.$docsify.terms, configuration);
        next(content);
    }
    function loadProperties() {
        if (window.$docsify !== undefined && window.$docsify.glossify !== undefined) {
            var configuredProperties = window.$docsify.glossify;
            return configFromYaml(configuredProperties);
        } else {
            return defaultGlossifyConfig();
        }
    }
    function install(hook, _vm) {
        var configuration = loadProperties();
        if (configuration.debug) {
            console.log("Using config options: ".concat(configuration.glossaryLocation, ", ").concat(configuration.terminologyHeading));
        }
        hook.beforeEach((function(content, next) {
            if (window.location.hash.match(/_glossary/g)) {
                next(content);
                return;
            }
            if (!window.$docsify.terms) {
                fetch(configuration.glossaryLocation).then((function(data) {
                    data.text().then((function(text) {
                        window.$docsify.terms = loadTerminology(text, configuration);
                        injectTerminologyInContent(content, configuration, next);
                    }));
                }));
            }
            injectTerminologyInContent(content, configuration, next);
        }));
    }
    if (!window.$docsify) {
        window.$docsify = {};
    }
    window.$docsify.plugins = (window.$docsify.plugins || []).concat(install);
    exports.install = install;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    return exports;
}({});
