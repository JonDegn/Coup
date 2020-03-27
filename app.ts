// Colyseus + Express
import { Server } from "colyseus";
import { createServer } from "http";
import { GameRoom } from "./rooms/lobby";
import express from 'express';
const port = Number(process.env.port) || 3001;

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app)
});


gameServer.listen(port);
console.log("server started")

gameServer.define("lobby", GameRoom)

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
