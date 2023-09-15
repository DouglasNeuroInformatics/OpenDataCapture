import React, { useContext } from 'react';
import { Form, StepperContext } from '@douglasneuroinformatics/ui';
export var FormQuestions = function (_a) {
  var _b = _a.instrument,
    content = _b.content,
    validationSchema = _b.validationSchema,
    onSubmit = _a.onSubmit;
  var updateIndex = useContext(StepperContext).updateIndex;
  var handleSubmit = function (data) {
    onSubmit(data);
    updateIndex('increment');
  };
  return React.createElement(
    'div',
    null,
    React.createElement(Form, { content: content, validationSchema: validationSchema, onSubmit: handleSubmit })
  );
};
