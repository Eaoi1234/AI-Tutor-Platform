import { Schema, model, Document, Types } from 'mongoose';
// import { ILearningModule } from './learningModuleModel';

export interface IFile extends Document {
  fileName: string;
  fileSize: number;
  fileType: string; 
  uploadAt: Date; 
  // moduleId: ObjectId[];
}

const fileSchema =  new Schema<IFile>({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true }, 
  uploadAt: { type: Date, required: true },

});
