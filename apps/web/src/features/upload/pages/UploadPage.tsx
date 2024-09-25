import { useState } from 'react';

import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type {
  AnyUnilingualFormInstrument,
  AnyUnilingualScalarInstrument,
  FormTypes
} from '@opendatacapture/runtime-core';
import type { UploadInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import axios from 'axios';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { useInstrument } from '@/hooks/useInstrument';

import { applyLineTransforms, createUploadTemplateCSV, getZodTypeName, valueInterpreter } from '../utils';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const params = useParams();
  const instrument = useInstrument(params.id!) as AnyUnilingualFormInstrument | null;

  const sendInstrumentData = async (data: UploadInstrumentRecordData) => {
    await axios.post('/v1/instrument-records/upload', data);
    addNotification({ type: 'success' });
  };

  const handleTemplateDownload = () => {
    //to do
    //make sure the first two columns of the csv file are id and date
    //convert the given csv files as a json object
    //parse the json object through the instrument validation schema
    // if succcess full send the data to the backend to be stored
    const { content, fileName } = createUploadTemplateCSV(instrument!);
    void download(fileName, content);
  };

  const processInstrumentCSV = () => {
    const input = file!;
    const instrumentSchema = instrument!.validationSchema as z.AnyZodObject;
    const shape = instrumentSchema.shape as { [key: string]: z.ZodTypeAny };

    // console.log("instrument def",schema.shape)

    const reader = new FileReader();
    reader.onload = () => {
      let text = reader.result as string;

      let lines = text.split('\n');

      let data = lines.slice(1);

      //remove sample data if included
      if (data[0]?.includes('mouseNumber-LabHead-ProjectLead,yyyy-mm-dd')) {
        data = data.slice(1);
      }

      if (!lines) {
        return;
      }

      let result: UploadInstrumentRecordData = [];

      let headers: string[] = lines[0]!.split(',');

      //let identifiers: string[] = headers.slice(0,2)
      // let mouseInfo = headers.slice(0,2)
      // console.log(mouseInfo)
      //headers = headers.slice(2); //remove mouse id and date

      if (!headers) {
        return;
      }
      // console.log("these are the headers", headers)
      for (let line of data) {
        line = applyLineTransforms(line);

        let elements = line.split(',').map;

        const jsonLine: { [key: string]: unknown } = {};
        for (let j = 0; j < headers.length; j++) {
          const key = headers[j]!;
          if (INTERNAL_HEADERS[j]) {
            const expectedKey = INTERNAL_HEADERS[j];
            if (key === expectedKey) {
              jsonLine[headers[j]!] = key;
              continue;
            }
            addNotification({
              message: `Expected header at index '${j}' to be '${expectedKey}', got '${key}'`,
              type: 'error'
            });
            return;
          }
          const typeNameResult = getZodTypeName(shape[key]!);
          if (!typeNameResult.success) {
            addNotification({ message: typeNameResult.message, type: 'error' });
            return;
          }
          const valueInterpreterResult = valueInterpreter(
            elements[j]!,
            typeNameResult.typeName,
            typeNameResult.isOptional
          );
          if (!valueInterpreterResult.success) {
            addNotification({ message: valueInterpreterResult.message, type: 'error' });
            return;
          }
          jsonLine[headers[j]!] = valueInterpreterResult.value;
        }
        result.push(jsonLine);
      }
      result.pop();

      let submissions = result;

      for (const entry of result) {
        //console.log(instrument.validationSchema.array())
        let keys = Object.keys(entry);

        let mouseId = entry[keys[0]] as string;
        let entryDate = entry[keys[1]] as Date;

        console.log('removed stuff', mouseId, entryDate);

        delete entry[keys[0]];
        delete entry[keys[1]];

        const zodCheck = instrument.validationSchema.safeParse(entry);

        if (!zodCheck.success) {
          console.log(zodCheck.error);
          //create error message with zodcheck error messsage + zodcheck error path
          //addNotification({ message: zodCheck.error.issues[0]?.message, type: 'error' });
          addNotification({ type: 'error' });
          return;
        } else {
          console.log(zodCheck.success);
          addNotification({ type: 'success' });
          //void sendInstrumentData(entry,params.id!,mouseId,entryDate)
        }
      }

      void sendInstrumentData(result);
    };
    reader.readAsText(input);

    //to do
    //take validation schema types and title to use as column titles
    //make the first two columns of the template csv id and date
    //add the validation schema/content variables as column headers for csv
    //add the first line of the csv to be the data type (string, number, boolean, etc), also say if its optional or not
  };

  return (
    <div className="align-center items-center justify-center">
      <FileDropzone file={file} setFile={setFile} />
      <div className="mt-4 flex justify-between space-x-2">
        <Button disabled={!(file && instrument)} variant={'primary'} onClick={processInstrumentCSV}>
          Submit
        </Button>
        <Button disabled={!instrument} variant={'primary'} onClick={handleTemplateDownload}>
          <DownloadIcon />
          Download Template
        </Button>
      </div>
    </div>
  );
};
