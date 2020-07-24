const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-aman:aman@cluster0-mifbn.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);
const Item1 = new Item({
  name: "Welcome to your to-do list"
});
const Item2 = new Item({
  name: "Click +  to add new items"
});
const Item3 = new Item({
  name: "<-- click this to remove the item"
});
const startingList = [Item1, Item2, Item3];


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(startingList, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Sucess ");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newlistitems: foundItems,
      });
    }
  })
});

app.post("/", function(req, res) {
  const itemName = req.body.item;
  const listNAme = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listNAme == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listNAme
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listNAme);
    })
  }

});
app.get("/:customListName", function(req, res) {
  const listName = _.capitalize(req.params.customListName);
  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: startingList,

        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newlistitems: foundList.items
        });
      }
    }

  })



});
app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listname;
  if (listName == "Today") {
    Item.findByIdAndRemove(checkedItem, function(err) {
      if (!err) {
        console.log("Sucesfully deleted");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItem
        }
      }
    }, function(err) {
      if (!err) {
        res.redirect("/" + listName);
        console.log("Deletion Sucessfull");
      } else {
        console.log(err);
      }
    });
  }

});
app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "WorkList",
    newlistitems: workitems,
  });
});

app.post("/work", function(req, res) {
  let item = req.body.item;
  workitems.push(item);
  res.redirect("/work");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started");
});
