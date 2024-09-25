import { useState } from 'react';

import { isNumberLike, parseNumber } from '@douglasneuroinformatics/libjs';
import { FileDropzone } from '@douglasneuroinformatics/libui/components';
import { Button } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument, Json } from '@opendatacapture/runtime-core';
import type { UploadInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';
import axios from 'axios';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { useInstrument } from '@/hooks/useInstrument';

import { getZodTypeName } from '../utils';

export const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const params = useParams();
  const instrument = useInstrument(params.id!) as AnyUnilingualScalarInstrument | null;

  const sendInstrumentData = async (data: Json, instrumentId: string, subjectId: string, date: Date) => {
    await axios.post('/v1/instrument-records/upload', {
      data,
      date: date,
      instrumentId,
      subjectId: subjectId
    } satisfies UploadInstrumentRecordData);
    addNotification({ type: 'success' });
  };

  const handleTemplateDownload = () => {
    //to do
    //make sure the first two columns of the csv file are id and date
    //convert the given csv files as a json object
    //parse the json object through the instrument validation schema
    // if succcess full send the data to the backend to be stored
    if (!instrument) {
      return;
    }

    const instrumentSchema = instrument.validationSchema as z.AnyZodObject;
    const shape = instrumentSchema.shape as { [key: string]: z.ZodTypeAny };

    const columnNames = Object.keys(instrumentSchema.shape as z.AnyZodObject);

    let csvColumns = 'MouseID,Date,' + columnNames.join(',') + '\n';

    let sampleData = '';

    for (const col of columnNames) {
      const typeName = getZodTypeName(shape[col]!);

      const sampleColData = sampleDataGenerator(typeName);

      sampleData += ',' + sampleColData;
    }

    const fileName = instrument.details.title + ' template';

    csvColumns += 'mouseNumber-LabHead-ProjectLead,yyyy-mm-dd' + sampleData + '\n';

    void download(`${fileName}.csv`, () => {
      return csvColumns;
    });

    return;
  };

  const valueInterpreter = (entry: null | string, zType: string) => {
    if (!entry) {
      return;
    }
    switch (zType) {
      case 'ZodString':
        return entry;
      case 'ZodNumber':
        if (isNumberLike(entry)) {
          return parseNumber(entry);
        } else {
          return null;
        }
      case 'ZodBoolean':
        if (entry) {
          return entry.toLowerCase() === 'true';
        }
        return null;
      case 'ZodSet':
        if (entry.includes('SET(')) {
          let setData = entry.slice(4, -1);

          let setDataList = setData.split('+');

          //Captitalize the first letter of the word
          setDataList = setDataList.map((word) => word.charAt(0).toUpperCase() + word.slice(1));

          return new Set(setDataList);
        }
        return null;

      default:
        return null;
    }
  };

  const sampleDataGenerator = (zType: null | string) => {
    switch (zType) {
      case 'ZodBoolean':
        return 'true/false';
      case 'ZodNumber':
        return 'number';
      case 'ZodSet':
        return 'SET(a,b,c)';
      case 'ZodString':
        return 'string';
      default:
        return '';
    }
  };

  const processInstrumentCSV = () => {
    if (!file) {
      return;
    }
    if (!instrument) {
      return;
    }
    const input = file;
    const instrumentSchema = instrument.validationSchema as z.AnyZodObject;
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

      let result = [];

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
        //find SET() data and replace the commas with plus signs
        if (line.includes('SET(')) {
          for (let i = line.indexOf('SET(') + 4; i < line.length; i++) {
            if (line.charAt(i) === ')') {
              break;
            }
            if (line.charAt(i) === ',') {
              line.charAt(i).replace(',', '+');
            }
          }
        }

        let elements = line.split(','); //.slice(2);
        //console.log('elements to be inputed', elements)
        let jsonLine = {};

        for (let j = 0; j < headers?.length; j++) {
          if (!headers) {
            return;
          } else {
            const key = headers[j]!;
            if (key !== 'MouseID' && key !== 'Date') {
              const typeName = getZodTypeName(shape[key]!);
              jsonLine[headers[j]] = valueInterpreter(elements[j], typeName);
            } else {
              jsonLine[headers[j]] = elements[j];
            }
          }
        }
        result.push(jsonLine);
      }
      result.pop();

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
        } else {
          console.log(zodCheck.success);
          addNotification({ type: 'success' });
          //void sendInstrumentData(entry,params.id!,mouseId,entryDate)
        }
      }
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
        <Button variant={'primary'} onClick={processInstrumentCSV}>
          Submit
        </Button>
        <Button variant={'primary'} onClick={handleTemplateDownload}>
          <DownloadIcon />
          Download Template
        </Button>
      </div>
    </div>
  );
};
