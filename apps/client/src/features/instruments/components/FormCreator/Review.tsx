import React, { useState } from 'react';

import { Button, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';

import { SimpleForm } from './FormCreator';

const ReviewItem = ({ label, value }: { label: string; value: any }) => {
  return (
    <div>
      <span className="font-semibold">{label}: </span>
      <span>{value}</span>
    </div>
  );
};
export interface ReviewProps {
  form: Partial<SimpleForm>;
}

export const Review = ({ form }: ReviewProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const notifications = useNotificationsStore();

  const submitForm = async () => {
    await axios.post('/v1/instruments/forms', form);
    setIsSubmitted(true);
    notifications.addNotification({ type: 'success' });
  };

  return (
    <div>
      <h3 className="my-2 text-lg font-semibold">Basics</h3>
      <ReviewItem label="Name" value={form.name} />
      <ReviewItem label="Tags" value={form.tags} />
      <ReviewItem label="Version" value={form.version} />
      <h3 className="my-2 text-lg font-semibold">Details</h3>
      <ReviewItem label="Title" value={form.details?.title} />
      <ReviewItem label="Description" value={form.details?.description} />
      <ReviewItem label="Language" value={form.details?.language} />
      <ReviewItem label="Instructions" value={form.details?.instructions} />
      <ReviewItem label="Estimated Duration" value={form.details?.estimatedDuration} />
      <h3 className="my-2 text-lg font-semibold">Fields</h3>
      {Object.keys(form.content!).map((fieldName) => {
        const field = form.content![fieldName];
        return (
          <div key={fieldName}>
            <h5 className="font-semibold italic">{fieldName}</h5>
            <ReviewItem label="Kind" value={field.kind} />
            <ReviewItem label="Label" value={field.label} />
            <ReviewItem label="Description" value={field.description} />
            {field.kind === 'text' && <ReviewItem label="Variant" value={field.variant} />}
          </div>
        );
      })}
      <div className="mt-3">
        <Button className="w-full" disabled={isSubmitted} label="Submit" type="submit" onClick={submitForm} />
      </div>
    </div>
  );
};
