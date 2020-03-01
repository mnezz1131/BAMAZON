var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
const cTable = require('console.table');
var chosenItem;
var choiceArray = [];


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "Balrog#666",
  database: "bamazon"
});




// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  // run the start function after the connection is made to prompt the user
  displayItems();
  chooseItems()
    
});



//  // function which displays the Items for Sale
function displayItems() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.table(colors.magenta(res[i].item_id) + " | " + colors.green(res[i].product_name) + colors.cyan("  |  Department - ") + colors.magenta(res[i].dept_name) + colors.yellow("  |  Price -  " + res[i].price));
    }
    console.log("*-------------------------------------------------------------------------------------------------------------------------------------*");

  });
}




function chooseItems() {
  // query the database for all stock items
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to purchase
    inquirer.prompt([{
          name: "choice",
          type: "rawlist",
          choices: function () {
            var choiceArray = [];
            for (var i = 0; i < res.length; i++) {
              choiceArray.push(res[i].product_name)
            }

            return choiceArray

          },
          message: "What is the ID of the Item would you like to purchase?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many Items would you like to purchase?"
        }

      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name === answer.choice) { //use id
            chosenItem = res[i];
          }
        }
        console.log(colors.magenta("You chose to buy a " + chosenItem.product_name +" at a price of " +chosenItem.price));
        console.log("Items in Stock -  " + chosenItem.stock)
        console.log("Quantity you chose to purchase -  " + answer.quantity)
        console.log(chosenItem);      
        if (chosenItem.stock < parseInt(answer.quantity)) {
            console.log(colors.red("We only have " + chosenItem.stock + " "+chosenItem.product_name+ " in stock. Please enter a smaller number to purchase."));
          //  chooseItems();
        }else {
         
            
            console.log(colors.red("Your Purchase is complete!"))
            var updateStock = (chosenItem.stock - answer.quantity)
            var totalPrice = (answer.quantity * chosenItem.price)
            console.log("Remaining Stock is -  " + updateStock)
            console.log(colors.green("Your Total Price is - " + totalPrice))
    
    
            connection.query(`UPDATE products SET stock = ${updateStock} WHERE item_id = ${chosenItem.item_id}`, function(err, res){
                if (err){
                    throw err;
                } else{
                    console.log("Success", res)
                };
            
            })
        }
        connection.end()
      })
  })
}