import mongoose from 'mongoose';

export default async function connectToDatabase(mongoUri: string): Promise<boolean> {
  try {
    await mongoose.connect(mongoUri);
    return true;
  } catch (error) {
    console.error('An error occured while connecting to the database', error);
    return false;
  }
}
