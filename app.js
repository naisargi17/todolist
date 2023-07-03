//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ =require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://naisadmin:admin123@cluster0.evdl7ay.mongodb.net/todolistDB",)

const itemSchema = {
  name :String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name :"cook food"
});
const item2 = new Item({
  name : "journalling"
});
const item3 = new Item({
  name : "walk 8 mile"
});

const defaultItems = [item1,item2,item3];

const listSchema ={
  name :String,
  items: [itemSchema]
};
const List =mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("sucessfully done !!");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
     }});


});

app.get("/:customListName",function(req,res){
  const customListName =_.capitalize(req.params.customizelist);

  List.findOne({name :customListName}).then(function(foundList){
    if (!foundList){
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //Show an existing list

      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const ListName = req.body.list;
  const item =new Item({
    name :itemName
  });
  if(ListName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:ListName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ListName);
    });
  }
 
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(){
      console.log("sucessfully done !!");
      res.redirect("/");
    });
  }
  else{
     List.findOneAndUpdate({name :listName},{$pull: {items:{_id :checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName);
     });
  }
  
 
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
