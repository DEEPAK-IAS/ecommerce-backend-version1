import mongoose from 'mongoose';

const productWEIGHTsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
} , {timestamps: true});

const productWEIGHTModel = mongoose.model("productWEIGHT", productWEIGHTsSchema);

export default productWEIGHTModel;