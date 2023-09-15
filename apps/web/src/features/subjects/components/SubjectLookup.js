import React from 'react';
import { Modal } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IdentificationForm } from '@/components';
export var SubjectLookup = function (_a) {
  var show = _a.show,
    onClose = _a.onClose;
  var t = useTranslation().t;
  var navigate = useNavigate();
  var lookupSubject = function (formData) {
    axios
      .post('/v1/subjects/lookup', formData)
      .then(function (_a) {
        var identifier = _a.data.identifier;
        navigate(identifier);
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  return React.createElement(
    Modal,
    { open: show, title: t('viewSubjects.lookup.title'), onClose: onClose },
    React.createElement(
      'div',
      null,
      React.createElement(IdentificationForm, { fillActiveSubject: true, onSubmit: lookupSubject })
    )
  );
};
