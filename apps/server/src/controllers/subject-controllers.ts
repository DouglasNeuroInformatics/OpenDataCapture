import { MongoServerError } from 'mongodb';

import { AsyncController } from '../interfaces';
import Subject, { SubjectType } from '../models/Subject';
import createSubjectId from '../utils/createSubjectId';

export const getAllSubjects: AsyncController = async (req, res) => {
  let allSubjects: SubjectType[];
  try {
    allSubjects = await Subject.find();
    return res.status(200).json(allSubjects);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export const addNewSubject: AsyncController = async (req, res) => {
  const { firstName, lastName, dateOfBirth, sex } = req.body as SubjectType; // VALIDATE
  const subjectId = createSubjectId(firstName, lastName, new Date(dateOfBirth));
  const subject = new Subject({
    _id: subjectId,
    firstName: firstName,
    lastName: lastName,
    dateOfBirth: new Date(dateOfBirth),
    sex: sex
  });
  try {
    await subject.save();
    return res.status(201).end();
  } catch (error) {
    console.log(error);
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(400).end(); // Duplicate ID
    }
    return res.status(500).end();
  }
};

export const deleteSubjectById: AsyncController = async (req, res) => {
  try {
    await Subject.deleteOne({ _id: req.params.id });
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};
