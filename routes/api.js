/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const ThreadController = require('../controllers/threadController.js')
const ReplyController = require('../controllers/replyController.js')


module.exports = function (app) {
  const threadContr = new ThreadController();
  const replyContr = new ReplyController();
  
  app.route('/api/threads/:board')
    .post(function(req, res){
    threadContr.postThread(req.params.board, req.body.text, req.body.delete_password, function(err, response){
      if(err){return console.log("Controller err: " + err)};
      res.redirect("/b/"+ req.params.board);
    });
  })
    .get(function(req, res){
    threadContr.getThreads(req.params.board, (err, response)=>{
      res.json(response);
    })
  })
  .delete(function(req, res){
    threadContr.delThread(req.params.board, req.body.thread_id, req.body.delete_password, (err, response)=>{
      if(err){return res.send(err)};
      res.send("success");
    })
  })
  .put(function(req, res){
    threadContr.reportThread(req.params.board, req.body.thread_id, (err, response)=>{
      if(err){return res.send(err)};
      res.send("success");
    })
  })
  app.route('/api/replies/:board')
    .post(function(req, res){
    
    replyContr.postReply(req.params.board, req.body.thread_id, req.body.text, req.body.delete_password, (err, response)=>{
      if(err){return console.log(err)};
      res.redirect("/b/$" + req.body.board + "/$" + req.body.thread_id);
    })
  })
  .get(function(req, res){
    
    replyContr.getThread(req.params.board.slice(1), req.query.thread_id.slice(1), (err, response)=>{
      res.json(response);
    })
  })
  .delete((req, res)=>{
    
    replyContr.delReply(req.params.board, req.body.thread_id, req.body.reply_id, req.body.delete_password, (err, response)=>{
                        if(err){return res.send(err)};
                        
                        res.send("success");
                        })
  })
  
  .put( (req, res) => {
    replyContr.reportReply(req.params.board, req.body.thread_id, req.body.reply_id, (err, response) => {
      if(err) {return res.send(err)};
      res.send('success');
    });
  });

};
