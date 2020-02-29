var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
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
connection.connect(function (err) {
    if (err) throw err;
    runSearch();
});

function runSearch() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add a new product",
                "exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    displayItems();
                    break;
                case "View Low Inventory":
                    lowInvSearch();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add a new product":
                    addProduct();
                    break;
                case "exit":
                    connection.end();
                    break;
            }
        });
}

//Funtion to display all items for sale--------------------------------------------------------------------------
function displayItems() {
    inquirer
        .prompt({
            name: "display",
            message: "View all Items for sale:"
        })
        .then(function (answer) {
            var query = "SELECT * FROM products"
            connection.query(query, function (err, res) {
                for (var i = 0; i < res.length; i++) {
                    console.table(colors.magenta(res[i].item_id) + " | " + colors.green(res[i].product_name) + colors.cyan("  |  Department - ") + colors.magenta(res[i].dept_name) + colors.yellow("  |  Price -  " + res[i].price));
                }
                console.log("*-------------------------------------------------------------------------------------------------------------------------------------*");

                runSearch();
            });
        });
}

//Funtion to search all items with stock less than 10----------------------------------------------------------------------
function lowInvSearch() {
    var query = "SELECT item_id, product_name, dept_name, stock FROM products WHERE stock < 10";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(colors.magenta(res[i].item_id) + " | " + colors.green(res[i].product_name) + colors.cyan("  |  Department - ") + colors.magenta(res[i].dept_name) + colors.yellow("  |  Stock -  " + res[i].stock));

        }
        runSearch();
    });
}

//Funtion to add inventory -------------------------------------------------------------------------------------------------
function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // once you have the items, prompt the manager for which item to add
        inquirer
            .prompt([{
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].item_id); 
                        }
                        return choiceArray;
                    },
                    message: "What item would you like to Update?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many items would you like to add?"
                }
            ])
            .then(function (answer) {
                // get the information of the chosen item
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].item_id === answer.choice) { //use id
                        chosenItem = res[i];
                    }
                }

                update();

                function update() {
                    console.log(colors.magenta("You chose to Update" + chosenItem.product_name));
                    console.log("Items in Stock -  " + chosenItem.stock)
                    console.log("Quantity you chose to Update -  " + answer.quantity)
                    console.log(chosenItem);

                    var updateStock = (chosenItem.stock + parseInt(answer.quantity))
                    // var totalPrice = (answer.quantity * chosenItem.price)
                    console.log("Remaining Stock is -  " + updateStock)

                    connection.query(`UPDATE products SET stock = ${updateStock} WHERE item_id = ${chosenItem.item_id}`, function (err, res) {
                        if (err) {
                            throw err;
                        }
                        // else{
                        //     console.log("Success", res);
                        // };
                    })
                }
                runSearch();
            })
    })
}



// function addProduct() {
    function addProduct() {
      // prompt for info about the item being added to inventory 
      inquirer
        .prompt([
          {
            name: "product",
            type: "input",
            message: "What is the item you would like to add to inventory?"
          },
          {
            name: "dept",
            type: "input",
            message: "What Department would you like to place the item in in?"
          },
          {
            name: "stock",
            type: "input",
            message: "How many items you adding?"
          },  
          {
            name: "price",
            type: "input",
            message: "What is the selling price of the item?",
            validate: function(value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            }
          }
        ])
        .then(function(answer) {
          // when finished prompting, insert a new item into the db with that info
          connection.query(
            "INSERT INTO products SET ?",
            {
             //columns name is item name// 
              product_name: answer.product,
              dept_name: answer.dept,
              stock: answer.stock,
              price: answer.price,
              
                          },
            function(err) {
              if (err) throw err;
    
              console.log("Your update was created successfully!");
       
              runSearch();
            }
          );
        });
    }