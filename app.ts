import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import CommentsRoutes from "./routes/commentsRoutes";
import PostsRoutes from "./routes/postsRoutes";
import ImagesRoutes from "./routes/imagesRoutes";
import ServicesRegister from "./services/servicesRegister";
import UsersRoutes from "./routes/usersRoutes";
import DBRoutes from "./routes/DBRoutes";
import OAuthRoutes from "./routes/oauthRoutes";
import CorsMiddleware from "./middlewares/CORSMiddleware";

const app = express();

ServicesRegister.RegisterServices();
const commentsRoutes = new CommentsRoutes();
const postsRoutes = new PostsRoutes();
const usersRoutes = new UsersRoutes();
const imagesRoutes = new ImagesRoutes();
const dbRoutes = new DBRoutes();
const oauthRoutes = new OAuthRoutes();

const cors = new CorsMiddleware();
app.use(cors.corsOptions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dir = "./images";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
app.use(express.static("images"));

app.use("/api/setup", dbRoutes.router);
app.use("/api/login", oauthRoutes.router);
app.use("/api/users", usersRoutes.router);
app.use("/api/posts", postsRoutes.router);
app.use("/api/comments", commentsRoutes.router);
app.use("/api/images", imagesRoutes.router);

export default app;
