let mongoose = require("mongoose");
const Chat = require("./MODELS/chat.js");

main()
.then(() => {console.log("Connection Successful.")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

let chats = [
    {
        from: "Sahil",
        to: "Shree",
        msg: "Hari Om, Shree.",
        created_at: new Date()
    },
        {
        from: "Neelam",
        to: "Varad",
        msg: "Ambadnya",
        created_at: new Date()
    },
        {
        from: "Dev",
        to: "Saee",
        msg: "Nathsamvidh",
        created_at: new Date()
    }
]

Chat.insertMany(chats);