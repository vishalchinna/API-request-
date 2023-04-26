const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbpath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;

const intilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit(1);
  }
};

intilizeDbAndServer();

const convertDbObjectToResponseObject = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
    directorName: dbobject.director_name,
  };
};
// API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie
    `;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id , movie_name , lead_actor)
    VALUES (${directorId} , '${movieName}' , '${leadActor}')
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
  console.log("added");
});

// API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT * FROM MOVIE WHERE movie_id = ${movieId}
    `;
  const movie = await db.get(movieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
     UPDATE movie SET 
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
     WHERE 
     movie_id = ${movieId};
     `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE
    movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// API 6

app.get("/directors/", async (request, response) => {
  const directorQuery = `
         SELECT * FROM director
    `;
  const directorArray = await db.all(directorQuery);
  response.send(
    directorArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const director_id = directorId;
  const getMoviesQuery = `
    SELECT movie_name FROM movie INNER JOIN director 
    WHERE movie.director_id = director.director_id;
    `;
});

module.exports = app;
