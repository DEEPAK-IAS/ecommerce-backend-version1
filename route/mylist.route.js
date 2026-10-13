import { Router } from "express";
import { addToMyList, deleteToMyList, getMyList } from "../controllers/myList.controller.js";
import auth from "../middlewares/auth.js"
const MyListRouter = Router();

MyListRouter.post("/add",auth,addToMyList)
            .delete("/:id",auth,deleteToMyList)
            .get("/all",auth,getMyList)

export default MyListRouter;