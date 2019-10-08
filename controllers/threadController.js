const MongoClient = require("mongodb");
const CONNECTION_STRING = "mongodb+srv://Ampatte2:Roflpwn123@cluster0-fdw4r.mongodb.net/admin?retryWrites=true&w=majority";
const ObjectId = MongoClient.ObjectId;

function ThreadController(){
  this.postThread = function(board, text, delete_password, callback){
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err) {return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.insertOne({text: text || "",
                           created_on: new Date(),
                           bumped_on: new Date(),
                           report: false,
                           delete_password: delete_password || "",
                           replies: []},
                          function(err, dbRes){
        if (err){return console.log(err)};
        callback(null, dbRes);
      })
    })
  }
  this.getThreads = function(board, callback){
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err) {return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.find({}, {limit: 10, sort: [["bumped_on", -1]]}).project({reported: 0, delete_password: 0}).toArray((err, dbRes)=>{
      if (err){return console.log(err)};
      let result = dbRes.map(elem =>{
        elem.replyCount = elem.replies.length;
        elem.replies = elem.replies.slice(elem.replies.length>= 3 ? -3: -elem.replies.length);
        elem.replies = elem.replies.map(item=>{delete item.reported; delete item.delete_password; return item;})
        return elem;
      })
      callback(null, result);
      })
    })
  }
  this.delThread = function(board, thread_id, delete_password, callback){
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err) {return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.findOne({_id: ObjectId(thread_id)},
                        function(err, dbRes){
        if (err){return console.log(err)};
        if(dbRes=== null){return callback("incorrect thread_id", null)};
        if (dbRes.delete_password !== delete_password){return callback("incorrect password")};
        collection.deleteOne({_id: ObjectId(dbRes._id)},
                            function(err, dbRes2){
          if (err){return console.log("Database deleteOne err: " + err)};
          callback(null, dbRes2);
        })
      })
    })
  }
  this.reportThread = function(board, thread_id, callback){
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err) {return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.updateOne({_id: ObjectId(thread_id)}, {$set: {reported: true}}, function(err, dbRes){
        if(err){return console.log(err)};
        if(dbRes.matchedCount== 0){return callback("incorrect thread_id", null)}
        callback(null, dbRes);
      })
    })
  }
};

module.exports = ThreadController;