import React, { useEffect, useMemo, useState } from 'react';
import { SearchBar, SelectDropdown } from '@douglasneuroinformatics/ui';
import { animated, useTrail } from '@react-spring/web';
import { useTranslation } from 'react-i18next';
import { InstrumentCard } from './InstrumentCard';
export var InstrumentShowcase = function (_a) {
  var instruments = _a.instruments;
  var _b = useTranslation(),
    i18n = _b.i18n,
    t = _b.t;
  var _c = useState(''),
    searchTerm = _c[0],
    setSearchTerm = _c[1];
  var languageOptions = Array.from(
    new Set(
      instruments.map(function (item) {
        return item.details.language;
      })
    )
  ).map(function (item) {
    return {
      key: item,
      label: t('languages.'.concat(item))
    };
  });
  var tagOptions = Array.from(
    new Set(
      instruments.flatMap(function (item) {
        return item.tags;
      })
    )
  ).map(function (item) {
    return {
      key: item,
      label: item
    };
  });
  var _d = useState([]),
    selectedLanguages = _d[0],
    setSelectedLanguages = _d[1];
  var _e = useState([]),
    selectedTags = _e[0],
    setSelectedTags = _e[1];
  useEffect(
    function () {
      var nativeLanguage = languageOptions.find(function (lang) {
        return lang.key === i18n.resolvedLanguage;
      });
      if (nativeLanguage) {
        setSelectedLanguages([nativeLanguage]);
      }
    },
    [i18n.resolvedLanguage]
  );
  var filteredInstruments = useMemo(
    function () {
      return instruments.filter(function (instrument) {
        var matchesSearch = instrument.details.title.toUpperCase().includes(searchTerm.toUpperCase());
        var matchesLanguages =
          selectedLanguages.length === 0 ||
          selectedLanguages.find(function (_a) {
            var key = _a.key;
            return key === instrument.details.language;
          });
        var matchesTags =
          selectedTags.length === 0 ||
          instrument.tags.some(function (tag) {
            return selectedTags.find(function (_a) {
              var key = _a.key;
              return key === tag;
            });
          });
        return matchesSearch && matchesLanguages && matchesTags;
      });
    },
    [instruments, searchTerm, selectedLanguages, selectedTags]
  );
  var trails = useTrail(
    filteredInstruments.length,
    function () {
      return {
        config: { tension: 280, friction: 60 },
        from: {
          opacity: 0,
          y: 80
        },
        to: {
          opacity: 1,
          y: 0
        },
        reset: true
      };
    },
    [filteredInstruments]
  )[0];
  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'my-5 flex flex-col justify-between gap-5 lg:flex-row' },
      React.createElement(SearchBar, {
        size: 'md',
        value: searchTerm,
        onChange: function (e) {
          setSearchTerm(e.target.value);
        }
      }),
      React.createElement(
        'div',
        { className: 'flex flex-grow gap-2 lg:flex-shrink' },
        React.createElement(SelectDropdown, {
          options: tagOptions,
          selected: selectedTags,
          setSelected: setSelectedTags,
          title: t('instruments.availableInstruments.filters.tags')
        }),
        React.createElement(SelectDropdown, {
          options: languageOptions,
          selected: selectedLanguages,
          setSelected: setSelectedLanguages,
          title: t('instruments.availableInstruments.filters.language')
        })
      )
    ),
    React.createElement(
      'div',
      { className: 'relative grid grid-cols-1 gap-5' },
      trails.map(function (style, i) {
        return React.createElement(
          animated.div,
          { key: i, style: style },
          React.createElement(InstrumentCard, { instrument: filteredInstruments[i] })
        );
      })
    )
  );
};
