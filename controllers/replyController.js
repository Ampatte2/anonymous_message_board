const MongoClient = require("mongodb");
const CONNECTION_STRING = "mongodb+srv://Ampatte2:Roflpwn123@cluster0-fdw4r.mongodb.net/admin?retryWrites=true&w=majority";
const ObjectId = MongoClient.ObjectId;

function ReplyController(){
  this.postReply = (board, thread_id, text, delete_password, callback) =>{
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      
      if (err) {return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.updateOne({_id: ObjectId(thread_id)}, {$set: {bumped_on: new Date()}, $push: {replies: {_id: new ObjectId(), text: text, created_on: new Date(), delete_password: delete_password, reported: false}}}, (err, dbRes)=>{
        if (err){return console.log(err)};
        callback(null,dbRes);
      })
    })
  }
  this.getThread = (board, thread_id, callback) =>{ 
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err){return console.log(err)};
      
      var database = db.db("test");
      var collection = database.collection(board);
      collection.findOne({_id: ObjectId(thread_id)}, function(err, dbRes){
        if (err){return console.log(err)};
        if(dbRes){
          delete dbRes.reported;
          delete dbRes.delete_password;
          dbRes.replies = dbRes.replies.map(item=>{ delete item.reported; delete item.delete_password; return item;});
        }
        callback(null, dbRes);
      })
    })
  }
  this.delReply = (board, thread_id, reply_id, delete_password, callback) =>{
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      if (err) {return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.findOne({_id: ObjectId(thread_id)}, function(err, dbRes){
        console.log(board,thread_id, delete_password)
        if (err){return console.log(err)};
        
        if (dbRes == null){return callback("incorrect thread_id", null)};
        let index = dbRes.replies.findIndex(elem => elem._id == reply_id);
        
        if (index === -1){return callback("incorrect reply_id", null)};
        
        
        if (dbRes.replies[index].delete_password != delete_password){return callback("incorrect password", null)};
        collection.findOneAndUpdate(
            { _id: ObjectId(thread_id),
              "replies._id": ObjectId(reply_id)},
            { $set: {"replies.$.text": '[deleted]' } },
            function(err, dbRes2){
              if(err) return console.log('Database updateOne err: '+err);
              console.log(dbRes2);
              callback(null, dbRes2);
        })
      })
    })
  }
  this.reportReply = (board, thread_id, reply_id, callback) =>{
    MongoClient.connect(CONNECTION_STRING, function(err, db){
      
      if(err){return console.log(err)};
      var database = db.db("test");
      var collection = database.collection(board);
      collection.findOneAndUpdate({_id: ObjectId(thread_id), "replies._id": ObjectId(reply_id)}, {$set:{"replies.$.reported":true}}, function(err, dbRes){
        if(err){return console.log(err)};
        if(dbRes.matchedCount ==0){return callback("incorrect thread_id or reply_id", null)};
        callback(null, dbRes);
      })
    })
  }
}

module.exports = ReplyController;