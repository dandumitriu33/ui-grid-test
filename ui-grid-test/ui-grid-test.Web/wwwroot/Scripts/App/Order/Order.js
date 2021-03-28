console.log("order js loaded");
var orderId = $("#orderId").text();
var orderDetails = [];
GetOrderDetails();


// UI-GRID TUTORIAL VERISON

//var app = angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.exporter', 'ui.grid.selection']);

//app.controller('OrderController', OrderController);

//function OrderController($scope, $http, $interval, $q) {
//    $scope.message = "Hello OrderController!"
//    $scope.message2 = "Hello again"
   
//    var vm = this;

//    function fakeI18n(title) {
//        return $q(function (resolve) {
//            $interval(function () {
//                resolve('col: ' + title);
//            }, 300, 1);
//        });
//    }

//    vm.gridOptions = {
//        exporterMenuCsv: false,
//        enableGridMenu: true,
//        gridMenuTitleFilter: fakeI18n,
//        columnDefs: [
//            { name: 'Id' },
//            { name: 'Name', enableHiding: false },
//            { name: 'VAT' },
//            { name: 'ProductCode' },
//            { name: 'Price' },
//            { name: 'Quantity' },
//            //{ name: 'Entity Id' },
//            //{ name: 'Order Property' },
//            //{ name: 'Desc' },
//        ],
//        gridMenuCustomItems: [
//            {
//                title: 'Rotate Grid',
//                action: function ($event) {
//                    this.grid.element.toggleClass('rotated');
//                },
//                order: 210
//            }
//        ],
//        onRegisterApi: function (gridApi) {
//            vm.gridApi = gridApi;

//            // interval of zero just to allow the directive to have initialized
//            $interval(function () {
//                gridApi.core.addToGridMenu(gridApi.grid, [{ title: 'Dynamic item', order: 100 }]);
//            }, 0, 1);

//            //gridApi.core.on.columnVisibilityChanged($scope, function (changedColumn) {
//            //    vm.columnChanged = { name: changedColumn.colDef.name, visible: changedColumn.colDef.visible };
//            //});
//        }
//    };

//    $http.get('/Order/GetAllProducts')
//        .then(function (response) {
//            vm.gridOptions.data = response.data;
//        });    
//}


// NEW SETRIO VERSION

var gridPrecomenzi;
var gridProduse;

var app = angular.module('app', [
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.resizeColumns',
    'ui.grid.infiniteScroll',
    'ui.grid.selection',
    'ui.grid.cellNav',
    'ro.setrio.lookup',
    'ro.setrio.entity',
    'ngSanitize',
    'localytics.directives',
    //'googlechart'
]);



var OrderController = function ($scope, $http, $interval) {    
    gridProduse = new GridSetrio($scope, $http, $interval, {
        options: {

            onDbClick: function (row) {
                {
                    produsCurent = row;
                    console.log("row double clicked " + produsCurent.Id);

                    try {
                        $.ajax({
                            type: "GET",
                            url: `/Order/GetProductById/?productId=${produsCurent.Id}`,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (data) {
                                if (data.Id == null) {
                                    SetPrecomanda(0);
                                    $("#txtCantitate").val("");
                                }
                                else {
                                    SetPrecomanda(data.Id);
                                    $("#myModalLabel").text(data.Name);
                                    $("#price").text(data.Price);
                                    $("#txtCantitate").val();
                                    $("#productId").text(data.Id);
                                }
                            },
                            complete: function () {
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                            }
                        });                        
                    }
                    catch (ex) {
                        console.error(ex);
                    };

                    //try {
                    //    $.ajax({
                    //        type: "POST",
                    //        url: "../Precomanda/GetPrecomandaByPunctLucruAndProdus",
                    //        data: JSON.stringify({
                    //            IdPunctLucru: GetClient().IdPunctLucru,
                    //            IdProdus: produsCurent.IdProdus
                    //        }),
                    //        contentType: "application/json; charset=utf-8",
                    //        dataType: "json",
                    //        success: function (msg) {

                    //            if (msg.Precomanda == null) {
                    //                SetPrecomanda(0);
                    //                $("#txtCantitate").val("");
                    //            }
                    //            else {
                    //                SetPrecomanda(msg.Precomanda.IdPrecomanda);
                    //                $("#txtCantitate").val(msg.Precomanda.Cantitate);
                    //            }
                    //        },
                    //        complete: function () {
                    //        },
                    //        error: function (xhr, ajaxOptions, thrownError) {
                    //        }
                    //    });
                    //} catch (ex) {
                    //    alertErorr(ex);
                    //} // OLD TRY CATCH

                    $("#modalCantitate").modal('show');
                    $("#txtCantitate").focus();
                    $("#txtCantitate").select();
                }

            },

            webMethod: {
                method: "/Order/GetAllProductsFilter",
                parametersAsync: function (param) {
                    //param.idDistribuitor = getIdDistribuitor();
                    //param.deficitar = false;
                }
            },
            columnDefs: [/*{ field: ' ', maxWidth: 5, enableFiltering: false, enableHiding: false, enableSorting: false, cellTemplate: '<div><center><button ng-click="getExternalScopes().add(row.entity)" class="btn btn-outline-primary btn-minier">Adauga+</button></center>&nbsp</div>' },*/
                //{
                //    field: ' ',
                //    filter: { disabled: true, placeholder: " " },
                //    width: 100,
                //    enableFiltering: true,
                //    enableHiding: false,
                //    enableSorting: false,
                //    cellTemplate: '<div><center><button ng-click="getExternalScopes().add(row.entity)" class="btn btn-outline-primary btn-minier">Adauga+</button></center>&nbsp</div>'
                //},

                {
                    field: 'Id',
                    displayName: "ID"
                },
                {
                    field: 'Name',
                    displayName: "Nume"
                },
                {
                    field: 'VAT',
                    displayName: "TVA"
                },
                {
                    field: 'ProductCode',
                    displayName: "Cod Produs"
                },
                {
                    field: 'Quantity',
                    displayName: "Cantitate"
                }
            ]
        },
        id: "gridProduse"
    });
    gridProduse.Load();

    //$scope.add = function (row) {
    //    produsCurent = row;
    //    try {
    //        $.ajax({
    //            type: "POST",
    //            url: "../Precomanda/GetPrecomandaByPunctLucruAndProdus",
    //            data: JSON.stringify({
    //                IdPunctLucru: GetClient().IdPunctLucru,
    //                IdProdus: produsCurent.IdProdus
    //            }),
    //            contentType: "application/json; charset=utf-8",
    //            dataType: "json",
    //            success: function (msg) {

    //                if (msg.Precomanda == null) {
    //                    SetPrecomanda(0);
    //                    $("#txtCantitate").val("");
    //                }
    //                else {
    //                    SetPrecomanda(msg.Precomanda.IdPrecomanda);
    //                    $("#txtCantitate").val(msg.Precomanda.Cantitate);
    //                }
    //            },

    //            complete: function () {
    //            },
    //            error: function (xhr, ajaxOptions, thrownError) {
    //            }
    //        });
    //    } catch (ex) {
    //        alertErorr(ex);
    //    }

    //    $("#modalCantitate").modal("show");
    //    $("#txtCantitate").focus();
    //    $("#txtCantitate").select();

    //}

};


// OLD VERSION FOR PRECOMANDA 

//var produsCurent = null;
//var precomanda = null;
//var cantitate;
//var gridPrecomenzi;
//var gridProduse;

//$(document).ready(function () {
//    //setControls();
//    console.log("doc ready Orderjs");
//    $("#cmbPunctLucru").on("change", function (e) {
//        gridPrecomenzi.options.webMethod.parameters.idPunctLucru = GetClient().IdPunctLucru;
//        gridPrecomenzi.RefreshData();
//    });

//    $("#dDistribuitori").on("change", function (e) {
//        gridProduse.RefreshData();
//    });
//});


//var MyController = function ($scope, $http, $interval) {
//    gridProduse = new GridSetrio($scope, $http, $interval, {
//        options: {
//            onDbClick: function (row) {
//                {
//                    produsCurent = row;
//                    try {
//                        $.ajax({
//                            type: "POST",
//                            url: "../Precomanda/GetPrecomandaByPunctLucruAndProdus",
//                            data: JSON.stringify({
//                                IdPunctLucru: GetClient().IdPunctLucru,
//                                IdProdus: produsCurent.IdProdus
//                            }),
//                            contentType: "application/json; charset=utf-8",
//                            dataType: "json",
//                            success: function (msg) {

//                                if (msg.Precomanda == null) {
//                                    SetPrecomanda(0);
//                                    $("#txtCantitate").val("");
//                                }
//                                else {
//                                    SetPrecomanda(msg.Precomanda.IdPrecomanda);
//                                    $("#txtCantitate").val(msg.Precomanda.Cantitate);
//                                }
//                            },
//                            complete: function () {
//                            },
//                            error: function (xhr, ajaxOptions, thrownError) {
//                            }
//                        });
//                    } catch (ex) {
//                        alertErorr(ex);
//                    }

//                    $("#modalCantitate").modal("show");
//                    $("#txtCantitate").focus();
//                    $("#txtCantitate").select();
//                }

//            },

//            webMethod: { method: "../../Administration/Nomenclatoare/GetProduseByDistribuitor", parametersAsync: function (param) { param.idDistribuitor = getIdDistribuitor(); param.deficitar = false; } },
//            columnDefs: [/*{ field: ' ', maxWidth: 5, enableFiltering: false, enableHiding: false, enableSorting: false, cellTemplate: '<div><center><button ng-click="getExternalScopes().add(row.entity)" class="btn btn-outline-primary btn-minier">Adauga+</button></center>&nbsp</div>' },*/
//                { field: ' ', filter: { disabled: true, placeholder: " " }, width: 100, enableFiltering: true, enableHiding: false, enableSorting: false, cellTemplate: '<div><center><button ng-click="getExternalScopes().add(row.entity)" class="btn btn-outline-primary btn-minier">Adauga+</button></center>&nbsp</div>' },

//                { field: 'NomenclatorProdus.Denumire', displayName: "Denumire" },
//                { field: 'NomenclatorProdus.Producator', displayName: "Producator" },
//                { field: 'NomenclatorProdus.DCI', displayName: "DCI" },

//                { field: 'NomenclatorProdus.UM', displayName: "UM" }
//            ]
//        },
//        id: "gridProduse"

//    });
//    gridProduse.Load();

//    $scope.add = function (row) {
//        produsCurent = row;
//        try {
//            $.ajax({
//                type: "POST",
//                url: "../Precomanda/GetPrecomandaByPunctLucruAndProdus",
//                data: JSON.stringify({
//                    IdPunctLucru: GetClient().IdPunctLucru,
//                    IdProdus: produsCurent.IdProdus
//                }),
//                contentType: "application/json; charset=utf-8",
//                dataType: "json",
//                success: function (msg) {

//                    if (msg.Precomanda == null) {
//                        SetPrecomanda(0);
//                        $("#txtCantitate").val("");
//                    }
//                    else {
//                        SetPrecomanda(msg.Precomanda.IdPrecomanda);
//                        $("#txtCantitate").val(msg.Precomanda.Cantitate);
//                    }
//                },

//                complete: function () {
//                },
//                error: function (xhr, ajaxOptions, thrownError) {
//                }
//            });
//        } catch (ex) {
//            alertErorr(ex);
//        }

//        $("#modalCantitate").modal("show");
//        $("#txtCantitate").focus();
//        $("#txtCantitate").select();

//    }
//}

// OLD MyController2

//var MyController2 = function ($scope, $http, $interval) {
//    gridPrecomenzi = new GridSetrio($scope, $http, $interval, {
//        options: {
//            showMod: true,
//            onModify: function (row) {
//                precomanda = row.Precomanda;
//                $("#modalCantitate").modal("show");
//                $("#txtCantitate").focus();
//                $("#txtCantitate").select();
//                $("#txtCantitate").val(row.Precomanda.Cantitate);

//            },
//            showRem: true,
//            onRemove: function (row) {
//                if (confirm("Sunteti sigur ca doriti sa stergeti  produsul din precomanda?")) {
//                    StergePrecomanda(row.Precomanda.IdPrecomanda);
//                }
//            },

//            selectedItems: [],
//            multiSelect: true,
//            webMethod: { method: "/Precomanda/GetPrecomenziByPunctLucru", parameters: { idPunctLucru: GetClient().IdPunctLucru } },
//            columnDefs: [
//                //{ field: 'Bifeaza', displayName: "Bifeaza", width: 65, cellTemplate: '<div><center><input type="checkbox"></center>&nbsp</div>' },

//                { field: 'Produs.Denumire', displayName: "Denumire" },
//                {
//                    field: 'Distribuitor', displayName: "Distribuitor"
//                },

//                { field: 'Precomanda.Cantitate', displayName: "Cantitate" }


//            ],

//        },
//        id: "gridPrecomenzi"
//    });

//    $scope.rowFormatter = function (row) {

//        if (row.entity.IsStoc != null && row.entity.IsStoc == true)
//            return "newOrder";
//    }
//    $scope.panelswitch = function () {
//        $scope.openS = !$scope.openS;
//    };
//    gridPrecomenzi.Load();

//    $scope.comanda = function () {
//        var detalii = gridPrecomenzi.gridApi.grid.api.selection.getSelectedRows();

//        try {
//            if (detalii.length < 1)
//                alertErorr("Trebuie sa selectati cel putin o precomanda!");
//            else {
//                $.ajax({
//                    type: "POST",
//                    url: "../Precomanda/TransformaPrecomanda",
//                    data: JSON.stringify({
//                        idPunctLucru: GetClient().IdPunctLucru,
//                        idFirma: GetClient().IdFirma, detalii: detalii
//                    }),
//                    contentType: "application/json; charset=utf-8",
//                    dataType: "json",
//                    success: function (msg) {
//                        if (msg.IdComandaClient != null) {
//                            var idCom = msg.IdComandaClient;

//                            window.location.href = "/Pharmacies/Comanda/Index?id=" + idCom + "&idPunctLucru=" + GetClient().IdPunctLucru + "-" + GetClient().IdFirma + "&idDistribuitor=" + getIdDistribuitor();
//                        }
//                        else
//                            alertErorr("Urmatoarele produse nu sunt pe stoc: \n" + msg + ".Veti primi o notificare cand va intra pe stoc")
//                    },
//                    complete: function () {

//                    },
//                    error: function (xhr, ajaxOptions, thrownError) {
//                    }
//                });
//            }
//        } catch (ex) {
//            alertErorr(ex);
//        }

//    };
//} // MyController2


function close_form() {
    $("#modalCantitate").modal("hide");
}

function checkAll() {
    check();
    this.onclick = uncheckAll;
}

function AdaugaProdus() {
    console.log("reached Add Product");
    var productId = $("#productId").text();
    var quantity = $("#txtCantitate").val();
    try {
        $.ajax({
            type: "POST",
            url: `http://localhost:62956/Order/AddProductToOrder/?orderId=${orderId}&productId=${productId}&quantity=${quantity}`,
            //data: JSON.stringify(precomanda),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                console.log("data?");
                console.log(data);
                orderId = data.OrderId;
                $("#orderId").text(orderId);
            },
            complete: function () {
                //$("#myModalSalveaza").modal("hide");
                //gridPrecomenzi.RefreshData();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("err data");
            }
        });
    } catch (ex) {
        alertErorr(ex);
    }    
}

function GetOrderDetails() {
    console.log("get order details reached - orderId: " + orderId);

    try {
        $.ajax({
            type: "GET",
            url: `/Order/GetOrderDetailsForOrder/?orderId=${orderId}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                console.log("data from getorederdetails");
                console.log(data);
                orderDetails = data;
                //populateOrderDetails(data);                
            },
            complete: function () {
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }
    catch (ex) {
        console.error(ex);
    };
}

function populateOrderDetails() {
    
    console.log("populating order details - ");
    GetOrderDetails();
    console.log(orderDetails);
    $("#orderDetailsContainer").empty();
    var element = `
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Produs</th>
                          <th scope="col">Cantitate</th>
                          <th scope="col">Pret</th>
                          <th scope="col">Valoare Totala</th>
                        </tr>
                      </thead>
                      <tbody id="orderTableRows">
                        
                      </tbody>
                    </table>
                  `;
    $("#orderDetailsContainer").append(element);
    $("#orderTableRows").empty();
    for (var i = 0; i < orderDetails.length; i++) {
        var detailsRowElement = `
                            <tr>
                              <td>${orderDetails[i].ProductName}</td>
                              <td>${orderDetails[i].Quantity}</td>
                              <td>${orderDetails[i].Price}</td>
                              <td>${orderDetails[i].LineTotal}</td>                              
                            </tr>                        
                                `;
        $("#orderTableRows").append(detailsRowElement);
    }
}

function SalveazaPrecomanda(precomanda) {
    try {
        $.ajax({
            type: "POST",
            url: "../Precomanda/SalveazaPrecomanda",
            data: JSON.stringify(precomanda),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {

            },
            complete: function () {
                $("#myModalSalveaza").modal("hide");
                gridPrecomenzi.RefreshData();
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    } catch (ex) {
        alertErorr(ex);
    }
}

function StergePrecomanda(idPrecomanda) {
    try {
        $.ajax({
            type: "POST",
            url: "../Precomanda/StergePrecomanda",
            data: JSON.stringify({ idPrecomanda: idPrecomanda }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {

            },
            complete: function () {
                gridPrecomenzi.RefreshData();
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    } catch (ex) {
        alertErorr(ex);
    }
}

function SetPrecomanda(idPrecomanda) {
    console.log("reached set Precomanda");
    //var c = GetClient();
    //precomanda = {
    //    IdPrecomanda: idPrecomanda,
    //    IdDistribuitor: getIdDistribuitor(),
    //    Cantitate: 0,
    //    IdProdus: produsCurent.NomenclatorProdus.IdProdus,
    //    IdFirma: c.IdFirma,
    //    IdPunctLucru: c.IdPunctLucru,
    //    IdComandaClient: -1
    //};
}
