import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash"

mongoose.connect("mongodb+srv://akash:akash0912@learnmdb.hlomhum.mongodb.net/todolist");
const app = express();

// let wdones;
const itemSchema = new mongoose.Schema({
    name: String
});

const listSchema = {
    name: String,
    items: [itemSchema]
}

const Item = mongoose.model("item", itemSchema);

const List = mongoose.model("List", listSchema)
// const wdone=["By food","cook food"];
// const item1=new Item({
//     name:"gabbu"
// });
// const item2=new Item({
//     name:"jhabbu"
// });
// const item3=new Item({
//     name:"tabbu"
// });

// const defaultitems=[item1,item2,item3];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
    const ndate = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const day = daysOfWeek[ndate.getDay()];
    const month = months[ndate.getMonth()];
    const date = ndate.getDate();
    const mydate = day + ", " + month + " " + date;
    Item.find({})
        .then((items) => {
            res.render("index.ejs", { date: "Today", wdones: items });
        })
});

app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    try {
        const findList = await List.findOne({ name: customListName }).exec();
        if (findList) {
            res.render("index.ejs", { date: findList.name, wdones: findList.items });
        } else {
            const list = new List({
                name: customListName,
                // items: defaultitems
            });
            await list.save();
            res.redirect("/" + customListName);
        }
    } catch (err) {
        console.error("Error:", err);
    }
});


app.post("/insert", async (req, res) => {
    const item = req.body.iname;
    const listname = req.body.list;
    const nitem = new Item({
        name: item
    });
    if (listname === "Today") {
        try {
            await nitem.save(); // Wait for the item to be saved
            res.redirect("/");
        } catch (err) {
            console.error("Error:", err);
        }
    } else {
        try {
            const findList = await List.findOne({ name: listname }).exec();
            findList.items.push(nitem); // Push the item object, not just the name
            await findList.save(); // Wait for the list to be saved
            res.redirect("/" + listname);
        } catch (err) {
            console.error("Error:", err);
        }
    }
});


app.post("/delete", async (req, res) => {
    const itemid = req.body.checkbox;
    const listname = req.body.listname;
    if (listname === "Today") {
        try {
            await Item.findByIdAndRemove(itemid).exec();
            res.redirect("/");
        }
        catch (err) {
            console.log(err);
        }
    }else{
        try{
            await List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemid}}})
            res.redirect("/"+listname);
        }
        catch (err) {
            console.log(err);
        }   
    }
});

app.listen(process.env.PORT||3000,function(){
    console.log("server is started at 3000")
})