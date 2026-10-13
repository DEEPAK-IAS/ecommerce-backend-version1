import mongoose from 'mongoose';

const homeSliderSchema = new mongoose.Schema({
  image: {
    type: [String],
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
} , {timestamps: true});

const homeSliderModel = mongoose.model("homeSlider", homeSliderSchema);

export default homeSliderModel;