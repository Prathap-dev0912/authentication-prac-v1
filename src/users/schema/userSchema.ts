import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String, default: null })
  otp: string | null;

  @Prop({ type: Date, default: null })
  otpExpiry: Date | null;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
