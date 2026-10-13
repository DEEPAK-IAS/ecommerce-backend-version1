import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("blog", blogSchema);

export default BlogModel;
