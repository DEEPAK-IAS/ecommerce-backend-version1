import mongoose from 'mongoose';

const productRamsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
} , {timestamps: true});

const productRamsModel = mongoose.model("productRAMs", productRamsSchema);

export default productRamsModel;