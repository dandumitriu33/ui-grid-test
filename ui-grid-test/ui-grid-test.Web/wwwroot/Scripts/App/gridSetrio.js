console.log("gridSetrio loaded");

function GridSetrio() {
    var self = this;
    self.load = false;
    self.page = 0;
    self.nr = 0;
    self.scope = arguments[0];
    self.http = arguments[1];
    self.interval = arguments[2];
    self.gridId = arguments[3].id;


    if (arguments[3].options != undefined) {
        self.options = arguments[3].options;
    }
    else {
        self.options = {};
    }

    if (arguments[3].entity != undefined) {
        self.entity = arguments[3].entity;
        self.entity.grid = new Object();
        self.entity.grid.options = self.options;
        self.options.RefreshFromEntity = function (pathImport) {
            try {

                self.RefreshDataLocal(pathImport);
            }
            catch (ex) {
                alert(ex);
            }
        }
    }
    self.options.pageLength = self.options.pageLength == undefined ? 100 : self.options.pageLength;
    self.options.gridId = self.gridId;

    self.dt = new Array();

    self.scope.gridScope = self.scope;
    self.scope[self.gridId] = self.options;
    self.isFilter = true;
    if (self.entity != null) {
        self.entity.isImport = self.options.isImport;

    }
    if (self.scope[self.gridId].useExternalFiltering == undefined)
        self.scope[self.gridId].useExternalFiltering = true;
    if (self.scope[self.gridId].useExternalSorting == undefined) {
        self.scope[self.gridId].useExternalSorting = true;
    }

    if (self.scope[self.gridId].modal == undefined) {
        self.scope[self.gridId].modal = true;
    }
    if (self.scope[self.gridId].multiSelect == undefined)
        self.scope[self.gridId].multiSelect = false;
    if (self.scope[self.gridId].storeFilter == undefined)
        self.scope[self.gridId].storeFilter = false;
    if (self.scope[self.gridId].enableRowSelection == undefined)
        self.scope[self.gridId].enableRowSelection = true;
    if (self.scope[self.gridId].allowCellFocus == undefined)
        self.scope[self.gridId].allowCellFocus = false;
    if (self.scope[self.gridId].enableRowHeaderSelection == undefined)
        self.scope[self.gridId].enableRowHeaderSelection = false;
    if (self.scope[self.gridId].noUnselect == undefined) {
        if (self.scope[self.gridId].multiSelect == true) {
            self.scope[self.gridId].noUnselect = false;
        }
        else {
            self.scope[self.gridId].noUnselect = true;
        }
    }
    self.scope.edit = function (entity) {
        alert(entity.age);
    };
    if (self.scope[self.gridId].infiniteScrollPercentage == undefined)
        self.scope[self.gridId].infiniteScrollPercentage = 15;
    self.dt = new Array();
    self.scope[self.gridId].data = self.dt;
    self.scope[self.gridId].rowTemplate = "  <div ng-class=\"getExternalScopes().rowFormatter( row )\" ng-dblclick=\"getExternalScopes().clickdb(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader; }\" ui-grid-cell></div> ",
        self.scope.clickdb = function (row) {

            if (self.scope[self.gridId].onDbClick != undefined) {

                self.scope[self.gridId].onDbClick(row);
            }
        }
    self.scope[self.gridId].modify = function (row) {


        if (self.options.onModify != undefined) {
            self.options.onModify(row);
        }
        if (self.entity != null)
            self.entity.Show(row);
    }

    self.scope[self.gridId].remove = function (row) {

        if (self.options.onRemove != undefined) {
            self.options.onRemove(row);
        }

        if (self.options.webMethodRemove != undefined) {
            var message = self.options.textRemove || "elementul";
            alertConfirm("Doriti sa stergeti " + message + "?", function () {

                var parameters = {};
                parameters.entity = row;
                parameters = JSON.stringify(parameters);
                ShowLoading();
                self.http.post(self.options.webMethodRemove.method, parameters)
                    .then(function (result) {
                        self.RefreshData();
                        HideLoading();

                    }, function (result) {
                        HideLoading();
                    });

            });
        }
    }
    self.scope[self.gridId].gridMenuCustomItems = [
        {
            title: 'Export excel',
            action: function ($event) {
                self.ExportExcel(false);
            }
        },
        {
            title: 'Export pdf',
            action: function ($event) {
                self.ExportPdf();
            }
        },
        {
            title: 'Export word',
            action: function ($event) {
                self.ExportWord();
            }
        },
        {
            title: 'Export text',
            action: function ($event) {
                self.ExportTxt();
            }
        },
        
    ];
    //alert("IAc" + self.scope[self.gridId].gridMenuCustomItems);
    self.scope.$watch(
        self.gridId + ".isImport",
        function (newValue, oldValue) {
            if (newValue == true) {
                self.scope[self.gridId].gridMenuCustomItems.push(
                    {
                        title: 'Descarca  macheta',
                        action: function ($event) {

                            self.ExportExcel(true);
                        },

               },
               {
                   title: 'Import',
                   action: function ($event) {
                       
                       self.entity.OpenImport();
                   }
               }
               );
                   }
                   else {
                     //  self.scope[self.gridId].gridMenuCustomItems.splice(3, 2);
                   }

        }
    );
    self.scope[self.gridId].onRegisterApi = function (gridApi) {
        self.loadUserPreference(gridApi.grid);
        self.scope[self.gridId].gridApi = gridApi;
        self.gridApi = gridApi;
        if (self.load == true) {
            self.Load();
        }
        if (self.options.onRegister != undefined) {
            self.options.onRegister(gridApi);
        }

        gridApi.selection.on.rowSelectionChanged(self.scope, function (row) {

            var valoare = "row.entity." + self.options.valueField;
            if (row != null) {

                if (self.options.multiSelect) {

                    if (self.selected == null || self.selected == undefined) {
                        self.selected = [];
                    }

                    if (row.isSelected) {
                        self.selected.push(eval(valoare));

                    }
                    else {
                        self.selected.splice(self.selected.indexOf(eval(valoare)), 1);
                    }

                }
                else {
                    if (row.isSelected) {
                        self.selected = eval(valoare);

                    }
                    else {
                        self.selected = null;
                    }
                }
            }
            if (self.options.rowSelectionChanged != undefined) {

                self.options.rowSelectionChanged(row);
            }
            ///
        });
        gridApi.core.on.filterChanged(self.scope, function () {
            var grid = this.grid;
            if (self.scope[self.gridId].useExternalFiltering == true) {
                if (self.filterTextTimeout) self.interval.cancel(self.filterTextTimeout);

                self.filterTextTimeout = self.interval(function () {
                    self.options.IsNotFocus = true;
                    self.IsNotLoading = true;
                    if (self.scope[self.gridId].storeFilter == true) {
                        self.SaveGridSettings(grid);
                    }
                    self.RefreshData();


                }, 700, 1); // delay 250 ms
            }
        });
        gridApi.core.on.renderingComplete(self.scope, function () {

            self.loadUserPreference(this.grid);
            if (self.scope[self.gridId].storeFilter == true) {
                //  alert("aa");
                //  self.RefreshData();
            }
        });
        gridApi.core.on.columnChanged(self.scope, function () {
            self.SaveGridSettings(this.grid);
        });
        gridApi.core.on.sortChanged(self.scope, function (grid, sortColumns) {
            if (self.scope[self.gridId].useExternalSorting == true) {
                self.options.IsNotFocus = true;
                self.RefreshData();

            }
        });

        gridApi.core.on.renderScrollBarComplete(self.scope, function () {
            self.SetScroll();

        });

        gridApi.infiniteScroll.on.needLoadMoreData(self.scope, function () {
            ++self.page;
            self.LoadServerData(null);
        });
        gridApi.core.on.showColumn(self.scope, function (grid) {

            if (grid.options.columnDefs.length > 0) {
                if (grid, self.options.showMod != true) {
                    grid, self.options.showMod = false;
                }
                if (grid, self.options.showRem != true) {
                    grid, self.options.showRem = false;
                }

                self.AddRem(grid, self.options.showRem);
                self.AddMod(grid, self.options.showMod);
                angular.forEach(grid.options.columnDefs, function (column, index) {

                    if (self.options.rowClass != undefined) {
                        column.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            return self.options.rowClass(grid, row, col, rowRenderIndex, colRenderIndex);
                        };
                    }
                    if (column.type == "bool") {
                        column.cellTemplate = '<div>{{row.entity.' + column.field + '?"Da":"Nu"}}</div>';

                    }

                });
            }
        });

    };

}


GridSetrio.prototype.loadUserPreference = function loadUserPreference(grid) {
    var columns = localStorage.getItem($(location).attr('pathname') + grid.options.gridId);

    if (columns) {

        grid.options.columnDefs = JSON.parse(columns);
        if (this.scope[this.gridId].storeFilter == true) {
            grid.options.columnDefs.field = "A";
        }

        //grid.columns = grid.options.columnDefs;
    }
};

GridSetrio.prototype.SaveGridSettings = function (grid) {
    var filteredColumns = [];
    try {
       // var grid = this.grid;
        angular.forEach(grid.columns, function (column, index) {

            //Need to removal the empty column / fix the group bug.
            if (column.field !== '' && typeof column.field !== 'undefined')  {
                var obj = grid.omitKeys(column, ["grid"]);
                obj.visible = column.colDef.visible;
                var o = {};
                o.field = obj.field;
                o.displayName = obj.displayName;
                o.visible = obj.visible;
                if (obj.cellTemplate!=null) {
                    o.cellTemplate = obj.cellTemplate;
                }
                if (obj.cellFilter != null) {
                    o.cellFilter = obj.cellFilter;
                }
                o.width = obj.width;
                this.push(o);
            }
        }, filteredColumns);
        try {
            var nrGr = parseInt(grid.options.gridId.replace(/[^\d.]/g, ''));
            if (nrGr > 0) {

                var gridId = grid.options.gridId.replace("" + nrGr, "");

                for (var i = 0; i < nrGr; i++) {
                    localStorage.setItem($(location).attr('pathname') + gridId + "" + nr, null);
                }
            }
        } catch (ex) {
        }
        localStorage.setItem($(location).attr('pathname') + grid.options.gridId, JSON.stringify(filteredColumns));

    }
    catch (ex) {
        alert(ex);
    }

}

GridSetrio.prototype.GetColumn = function (index) {
    return this.options.columnDefs[index];
}

GridSetrio.prototype.AddMod = function (grid, visible) {
    grid.options.columnDefs.unshift({ visible: visible, name: 'Modify', displayName: "", width: 90, enableFiltering: false, enableHiding: false, enableSorting: false, cellTemplate: '<center><button ng-click="getExternalScopes().' + this.gridId + '.modify(row.entity)" class="btn btn-outline-warning btn-xs text-warning">Modifica&nbsp;<i class="icon-edit"></i></button></center>' });
};

GridSetrio.prototype.GetSelectedRows = function () {
    return this.selected;
};

GridSetrio.prototype.GetScope = function () {
    return this.scope;
};

GridSetrio.prototype.RemoveItem = function (row) {
    var index = this.dt.indexOf(row)
    this.dt.splice(index, 1);
};

GridSetrio.prototype.ExportExcel = function (macheta, noload) {
    this.Export(macheta ? 4 : 1, noload);
};

GridSetrio.prototype.ExportCustom = function () {
    this.Export(5);
};


GridSetrio.prototype.OpenImport = function () {
    this.entity.OpenImport();
};

GridSetrio.prototype.ExportPdf = function () {
    this.Export(2);
};


GridSetrio.prototype.ExportWord = function () {
    this.Export(3);
};
GridSetrio.prototype.ExportTxt = function (noload) {
    this.Export(7, noload);
};

GridSetrio.prototype.Export = function (type, noLoad) {
     
    if (this.load || noLoad==true) {
        this.options.IsExport = true;
        this.typeExport = type;
        this.LoadServerData(null);
        this.options.IsExport = false;
    }
    else {
        alertErorr("Gridul nu este incarcat!");
    }
};


GridSetrio.prototype.SetScroll = function () {
    var self = this;
    if (self.scope[self.gridId].gridApi.grid.options != null && self.scope[self.gridId].gridApi.grid.options.data != null && self.scope[self.gridId].gridApi.grid.options.data.length > 0) {
        if (self.options.focused == undefined || self.options.focused != false) {
            self.scope[self.gridId].gridApi.selection.toggleRowSelection(self.scope[self.gridId].gridApi.grid.options.data[0]);
        }
    }
    else {
        if (self.options.focused == undefined || self.options.focused != false) {
            self.scope[self.gridId].gridApi.selection.raise.rowSelectionChanged(null);
        }
    }
};

GridSetrio.prototype.SetScrollPoz = function (poz) {
    var self = this;
    if (self.gridApi.grid.options != null && self.gridApi.grid.options.data != null && self.gridApi.grid.options.data.length > 0) {
        self.gridApi.cellNav.scrollTo(self.gridApi.grid, self.scope, self.gridApi.grid.options.data[poz], null);
    }
};

GridSetrio.prototype.ResizeGrid = function () {
    this.SetScroll();
    this.gridApi.grid.handleWindowResize();
};

GridSetrio.prototype.Refresh = function () {
    this.gridApi.grid.refresh();
};

GridSetrio.prototype.RefreshData = function (end) {
    this.RefreshDataLocal(null,end);
};

GridSetrio.prototype.RefreshDataLocal = function (pathImport, end) {

    this.nr = 0;
    this.load = true;

    if (
        this.gridApi != null) {

        if (pathImport != null) {

        }
        else {
            this.RemoveData();
            this.gridApi.grid.Nr = -1;
        }
        this.LoadServerData(pathImport,end);
    }
};


GridSetrio.prototype.showLoad = function (showLoad) {
    this.showLoad = showLoad;
};

GridSetrio.prototype.getLoad = function () {
    return this.showLoad;
};

GridSetrio.prototype.AddRem = function (grid, visible) {
    grid.options.columnDefs.unshift({ visible: visible, name: 'Remove', displayName: "", width: 90, enableFiltering: false, enableHiding: false, enableSorting: false, cellTemplate: '<center><button ng-click="getExternalScopes().' + this.gridId + '.remove(row.entity)" class="btn btn-outline-danger btn-xs text-danger">Sterge&nbsp;<i class="icon-trash"></i></button></center>' });

};

GridSetrio.prototype.Load = function () {
    this.load = true;
    if (this.gridApi != null) {
        if (this.options.webMethod != undefined)
            this.LoadServerData(null);

    };

};

GridSetrio.prototype.Selection = function (filters) {
    // alert("Set selections" + this.options.gridId + " " + filters);
    this.selected = filters;
};

GridSetrio.prototype.GetSelectedArray = function () {


    return this.options.multiSelect ? this.selected : [this.selected];
};


GridSetrio.prototype.LoadServerData = function (pathImport,end) {
    var parameters = null;
    var self = this;

    var isExport = self.options.IsExport || false;
    if (this.options.webMethod != undefined && this.options.webMethod != null) {
        parameters = {};
        var columns = this.GetColumFilter();

        var Import = pathImport != null ? { Path: pathImport, RemoveNomen: this.options.RemoveNomen } : null;
        parameters["filters"] = { Grid: this.gridId, Import: Import, IsImport: pathImport != null ? true : false, Export: this.GetExport(), IsExport: isExport, FilterColums: columns, PagePoz: this.page, PageLength: this.options.pageLength, SelectedProperties: (this.options.valueField != undefined ? this.options.valueField : null), SelectAll: this.selectAll, Selected: (this.selected != undefined ? self.GetSelectedArray() : null) };
        if (this.options.webMethod.parameters != undefined) {
            for (var a in this.options.webMethod.parameters) {
                parameters[a] = this.options.webMethod.parameters[a];
            }
        }

        if (this.options.webMethod.parametersAsync != undefined) {
            this.options.webMethod.parametersAsync(parameters);

        }

    }


    parameters = JSON.stringify(parameters);
    if (self.IsNotLoading != true)
     ShowLoading();

    this.http.post(this.options.webMethod.method, parameters)
        .then(function (result) {

            if (pathImport != null) {
                self.RemoveData();
                self.gridApi.grid.Nr = -1;
            }
            try {

                if (!isExport) {

                    if (result != null && result.data != null && result.data.Query != null) {
                        if (result.data.SelectAll != null) {

                            self.selected = result.data.SelectAll;
                        }
                        var selected = self.GetSelectedArray();
                        if (self.options.onEndData) {
                            self.options.onEndData(result.data.Query);
                        }
                        if (self.entity != null) {
                            self.entity.SetEntity(result.data.Entity);
                        }

                        if (result.data.Query.length == 0) {

                            self.gridApi.grid.Finish = true;
                        }
                        angular.forEach(result.data.Query, function (column, index) {
                            column = formatDateObject(column);

                            if (self.options.valueField != undefined && self.selected != undefined && selected.length > 0) {
                                var val = eval("column." + self.options.valueField);
                                val = val.getMonth ? ("" + val) : val;
                                column.isSelected = (selected.indexOf(val) >= 0 ? true : false);
                            }
                           self.dt.push(column);

                        });


                        if (result.data.Query.length == self.options.pageLength) {

                            self.gridApi.infiniteScroll.dataLoaded();
                        }
                        if (self.nr == 0) {
                            self.ResizeGrid();
                            if (self.options.onLoadDataFirst && self.dt.length > 0) {

                                self.options.onLoadDataFirst(self.dt[0]);
                            }
                            self.options.IsNotFocus = false;
                            self.nr++;
                        }
                    }

                    if (Import != null && self.options.onEndDataImport) {
                        self.options.onEndDataImport();
                    }
                    if (end != null)
                        end();
                }
                else {
                    $.fileDownload('/Base/Export/?key=' + result.data)
                        .done(function () { alert('File download a success!'); })
                        .fail(function () { alert('File download failed!'); });

                }
            }
            catch (ex) {
                alert(ex);
            }

            if (pathImport != null) {
                alertSucces("Importul s-a realizat cu succes!");
            }
            if (self.IsNotLoading !=true)
                HideLoading();
            self.IsNotLoading = false;

        }, function (result) {
            //alert("daa" + pathImport);
            if (pathImport != null) {
                var mes = result != null && result.data != null && result.data != "" ? result.data : "Eroare la import nomenclator!";

                alertErorr(mes);

            }
            HideLoading();
        });
};


GridSetrio.prototype.GetExport = function () {
    var result = [];
    if (this.options.IsExport == true) {
        if (this.options.columnDefs != null) {
            angular.forEach(this.options.columnDefs, function (column, index) {
                result.push(
                    {
                        Display: column.displayName,
                        ColumnName: column.field,
                        Format: column.cellFilter != null ? column.cellFilter : column.format

                    }
                );
            });
        }
    }
    return {
        TypeExport: this.typeExport,
        Name: this.options.exportName || this.gridId,
        MachetaImport: this.options.machetaImport,
        ColumnsFormat: this.options.IsExport == true ? result : null
    };
};

GridSetrio.prototype.GetData = function () {
    return this.dt;
};


GridSetrio.prototype.GetColumFilter = function () {
    var self = this;
    var columns = new Array();
    if (this.gridApi.grid.options.columnDefs.field != undefined) {
        angular.forEach(this.gridApi.grid.options.columnDefs, function (column, index) {

            if (column.visible != false && column.field != null && column.field.trim() != "" && column.field != "Modify" && column.field.indexOf('Modify') && column.field != "Remove" && column.field.indexOf('Remove') != 0) {
                columns.push({ ColumnName: column.field, Value: self.GetFilterColumnValue(column), IsDesc: (column.sort != undefined && column.sort.direction == "desc" ? true : false) });
            }
        });
    }
    else {

        angular.forEach(this.gridApi.grid.columns, function (column, index) {

            if (column.visible && column.field != null && column.field.trim() != "" && column.field != "Modify" && column.field.indexOf('Modify') && column.field != "Remove" && column.field.indexOf('Remove') != 0) {
                columns.push({ Format: column.cellFilter, ColumnName: column.field, Value: self.GetFilterColumnValue(column), IsOrder: (column.sort != undefined && column.sort.priority != undefined ? true : false), IsDesc: (column.sort != undefined && column.sort.direction == "desc" ? true : false) });
            }
        });
    }
    return columns;
};


GridSetrio.prototype.ResetFilter = function () {
    var existFilter = false;
    //alert(this.gridId);
    var selfT = this;
    angular.forEach(this.gridApi.grid.columns, function (column, index) {

        if (column.visible && column.field != null && column.field.trim() != "" && column.field !== "Modify" && column.field != "Remove") {
            if (column.filters[0].term != null && column.filters[0].term != "") {
                existFilter = true;
                column.filters[0].term = "";
            }

        }
    });
    this.SetFocusFilter();
    return existFilter;
};


GridSetrio.prototype.SetFocusFilter = function () {
    var selfT = this;
    try {
        this.interval(function () {

            try {
                $("#g" + selfT.gridId).find('.ui-grid-filter-input')[0].focus();
            }
            catch (ex1) {

            }
        }, 100, 1);
    }
    catch (ex) {
    }
};


GridSetrio.prototype.GetFilterColumnValue = function (column) {


    if (column.filters != undefined && column.filters.length > 0 && column.filters[0].term != undefined && column.filters[0].term != "") {
        if (column.colDef == null || column.colDef.type != "bool") {
            return column.filters[0].term;
        }
        else {
            var da = "da";
            var nu = "nu";
            if (da.indexOf(column.filters[0].term.toLowerCase()) >= 0) {
                return "true";
            }
            else if (nu.indexOf(column.filters[0].term.toLowerCase()) >= 0) {
                return "false";
            }
        }
    }
    return "";
}

GridSetrio.prototype.RemoveData = function () {
    this.page = 0;
    this.dt.length = 0;
};

GridSetrio.prototype.RemoveRefresh = function () {
    this.RemoveData();
    this.gridApi.grid.refresh();

};

GridSetrio.prototype.SelectAll = function (all) {
    if (all == false) {
        this.selected = undefined;

    }
    else {
        this.selectAll = true;
    }

    this.RefreshData();
    this.selectAll = false;

};

GridSetrio.prototype.RefreshDataWithColumns = function () {
    if (this.gridApi != null && this.gridApi.grid != null && this.gridApi.grid.options != null && this.gridApi.grid.options.columnDefs != null)
        this.gridApi.grid.options.columnDefs = [];
    this.RefreshData();
};

(function (factory) {

    /* istanbul ignore if */
    if (typeof define === 'function' && /* istanbul ignore next */ define.amd) {
        define(['angular'], factory); // AMD
    } else {
        factory(window.angular); // Browser global
    }
}(function (angular) {
    angular.module('ro.setrio.lookup', []).
        directive('lookup', function ($compile, $parse, $http, $interval, $filter) {

            return {
                restrict: 'EAC',
                require: 'ngModel',
                priority: 10,
                replace: true,
                scope: {
                    options: "=options"

                },
                /*  template: "<a id='pop-over-link' style='position: fixed; top: 100px; left: 100px;'>Show pop-over</a>" +
                      "<div id='pop-over-content' style='display:none'><button class='btn btn-primary' ng-click='testFunction()'>Ok</button></div>",*/

                link: function (scope, element, attrs, ngModel, ngOptions) {

                    var gridId = "grid" + attrs.id;
                    var self = this;
                    self.gridId = gridId;
                    element.html(getPopup(gridId, attrs));
                    var nr = 0;
                    $compile(element.contents())(scope);
                    scope.options.focused = false;
                    scope.options.onRegister = function (gridApi) {

                        gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                           
                            if (row != null) {
                                if (scope.options.onBeforeSelectedChange != null) {
                                    scope.options.onBeforeSelectedChange(row);
                                }
                                if (scope.options.multiSelect != true && (scope.options.IsNotFocus == undefined || scope.options.IsNotFocus == null || scope.options.IsNotFocus == false)) {
                                    $("#" + gridId +" ul").removeClass("show");
                                }

                                row.entity.isSelected = row.isSelected;
                                scope.setText(row.entity);

                                ngModel.$setViewValue(gridBannere.selected);
                                if (scope.options.onSelectedChange != null) {
                                    scope.options.onSelectedChange(row.entity, scope.$parent.master);

                                }
                            }
                            scope.options.IsNotFocus = false;
                        });
                    };
                    scope.options.getScope = function () {
                        return scope;
                    };
                    element.on('$destroy', function () {
                        ngModel.$render = null;
                    });
                    ngModel.$render = null;
                    scope.options.onLoadDataFirst = function (row) {
                        scope.setText(row);
                        if (row != null && scope.options.onSelectedChange != null && scope.$parent.master != null) {
                            scope.options.onSelectedChange(row, scope.$parent.master);
                        }
                    };

                    var gridBannere = new GridSetrio(scope, $http, $interval, {
                        options: scope.options,
                        id: gridId,
                    });
                    scope.inchide = function () {
                        $("#" + gridId + " ul").removeClass("show");
                    };
                    scope.showLookup = function () {
                        // var resetFilter = gridBannere.ResetFilter();
                        gridBannere.SetFocusFilter();

                        gridBannere.RefreshData();

                    };
                    scope.options.RefreshData = function () {

                        gridBannere.RefreshData();
                    };
                    scope.setText = function (row) {

                        if (scope.options.multiSelect) {

                            if (gridBannere.selected != null && gridBannere.selected.length > 0) {

                                if (row.isSelected) {

                                    scope.val = eval("row." + scope.options.textField) + "..." + gridBannere.selected.length;

                                }
                                else {
                                    var selectedRow = gridBannere.gridApi.grid.api.selection.getSelectedRows();
                                    if (selectedRow != null && selectedRow.length > 0) {
                                        scope.val = eval("selectedRow[0]." + scope.options.textField) + "..." + gridBannere.selected.length;
                                    }
                                    else {
                                        scope.val = "";
                                    }
                                }
                            }
                            else {
                                scope.val = "";
                            }
                        }
                        else {

                            if (row != null && row.isSelected) {
                                scope.val = eval("row." + scope.options.textField);
                            }
                            else {
                                scope.val = "";
                            }
                        }

                    }
                    ngModel.$render = function $render() {
                        if (ngModel.$viewValue != undefined && ngModel.$viewValue != null) {

                            if (gridBannere.options.fieldDisplay != null) {
                                scope.val = eval("scope.$parent." + gridBannere.options.fieldDisplay);
                            }
                            gridBannere.Selection(ngModel.$viewValue);
                        }
                        else {
                            gridBannere.Selection(null);
                            scope.val = "";
                        }
                        if (gridBannere.options.fieldDisplay == null && ngModel.$viewValue != null) {

                            gridBannere.RefreshData();
                        }
                    };
                    function getPopup(gridId, attrs) {
                        var class1 = attrs.disabled ? '' : 'data-toggle="dropdown"';
                        var str = '<div    class="dropdown"   id="' + gridId + '"  >';
                        str += '<a  ' + class1 + '  href="#" id="a' + gridId + '" ng-click="showLookup()">';
                        str += '<div  show-errors >';
                        str += '<input    ' + (attrs.required ? 'required' : '') + ' class="form-control" ng-model="val"   type="text"  id="txt' + gridId + '" name="txt' + gridId + '">';
                        //  str += '<span class="glyphicon glyphicon-search"></span>';
                        str += '</div></a>';
                        str += '<ul class="dropdown-menu" role="menu" >';
                        str += '<li> ';
                        //str += '<form  name="' + gridId + '"> ';
                        str += getGridTemplate(gridId);
                        str += " <button ng-hide='!options.multiSelect' ng-click='inchide()' class='btn pull-right' style='margin:10px'>Inchide</button></li></ul></div>";


                        return str;
                    };


                    function getGridTemplate(gridId) {
                        return '<div style="width:600px;height:300px;" id="g' + gridId + '" ui-grid="' + gridId + '" external-scopes="gridScope" ui-grid-resize-columns ui-grid-infinite-scroll ui-grid-cellnav ui-grid-selection></div> ';
                    }

                    function getInput(gridId) {
                        return '<input id="' + gridId + '" readonly/>';
                    };
                }
            }
        });

}));


(function (factory) {

    if (typeof define === 'function' && /* istanbul ignore next */ define.amd) {
        define(['angular'], factory); // AMD
    } else {
        factory(window.angular); // Browser global
    }
}(function (angular) {
    angular.module('ro.setrio.entity', []).
        directive('entity', function ($compile, $parse, $http, $interval, $filter, $rootScope, $upload) {

            return {
                restrict: 'EAC',
                //  require: '^ngModel',
                scope: {
                    id: "=id",
                },
                link: function (scope, element, attrs, ngModel) {
                    var idGrid = attrs.id;
                    scope.id.entityId = idGrid;

                    function EditSetrio() {
                    };

                    EditSetrio.prototype.Create = function (settings) {
                        this.colorbox_params = {
                            reposition: true,
                            scalePhotos: true,
                            scrolling: false,
                            previous: '<i class="icon-arrow-left"></i>',
                            next: '<i class="icon-arrow-right"></i>',
                            close: '&times;',
                            current: '{current} of {total}',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            photo: true,
                            onOpen: function () {                              
                                document.body.style.overflow = 'hidden';
                            },
                            onClosed: function () {
                                document.body.style.overflow = 'auto';
                            },
                            onComplete: function () {
                                $.colorbox.resize();
                            }
                        };

                        this.settings = settings;
                        this.settings.modal = this.settings.modal || false;
                        var self = this;
                        var templateHTML = this.GetTemplateColumn();

                        var closD = false;
                        angular.forEach(this.settings.properties, function (column, index) {
                            templateHTML += "<h " + (column.hide != null ? 'ng-hide=\"' + column.hide + '\"' : '') + ">";

                            if (column.columnWidth != null && column.columnWidth == 12) {
                                closD = true;
                                templateHTML += "</div>";
                            }
                            if (column.customTemplate != undefined) {
                                templateHTML += column.customTemplate;
                            }
                            else {

                                if (column.type != "checkbox")
                                    templateHTML +=
                                        '<label for="' + self.settings.entityId + column.field + '">' + self.fieldText(column) + ' </label>';


                                if (column.type == "datepicker") {
                                    templateHTML += self.CreateDatePicker(column);
                                }
                                else if (column.type == "checkbox") {
                                    templateHTML += self.CreateCheckBox(column);
                                }
                                else if (column.type == "editor" || column.type == "textarea") {
                                    templateHTML += self.CreateEditor(column);
                                }
                                else if (column.type == "lookup") {
                                    templateHTML += self.CreateLookup(column);
                                }
                                else if (column.type == "radiolist") {
                                    templateHTML += self.CreateRadioList(column);
                                }
                                else if (column.type == "uploadImage" || column.type == "uploadDoc") {
                                    templateHTML += self.CreateUpload(column);
                                }

                                else {
                                    templateHTML += '  <div class="form-group" show-errors ><input  ' + (column.disabled == true ? 'disabled ' : '') + self.GetValidator(column) + ' type="' + (column.type == 'number' ? 'number' : 'text') + '" id="' + self.settings.entityId + self.GetFieldPct(column) + '"  class="form-control" name="' + self.settings.entityId + self.GetFieldPct(column) + '"  ng-model="master.' + column.field + '"/></div>' +
                                        '';
                                }

                                if (column.br == true) {
                                    templateHTML += "</div>";
                                    templateHTML += self.GetTemplateColumn();
                                }
                            }
                            templateHTML += "</h>";
                        });
                        //if (settings.isImport) {
                        templateHTML += '<input accept="application/vnd.ms-excel" style="display:none"    type="file"   ng-file-select="onFileSelectImport($files)"  id="inpImport' + settings.entityId + '" name="inpImport' + settings.entityId + '"/>';
                        // }
                        
                        if (!closD)
                            templateHTML += "</div>";
                        templateHTML = "<form novalidate name='frm" + scope.id.entityId + "'>" + (this.settings.isPopup == false ? templateHTML : this.CreatePopup(templateHTML)) + "</form>";


                        var $div = $(templateHTML);


                        element.html($div);
                        $('.ace-thumbnails [data-rel="colorbox"]').colorbox(self.colorbox_params);
                        $('#id-input-file-1 , .upload-file').ace_file_input({
                            no_file: 'Nu exista fisiere ...',
                            btn_choose: "Alege",
                            btn_change: "Modifica",
                            droppable: false,
                            onchange: null,
                            icon_remove: "",
                            thumbnail: false //| true | large
                        });
                        scope.saveEntity = function () {

                            scope.$broadcast('show-errors-check-validity', "frm" + scope.id.entityId);
                            if (scope["frm" + scope.id.entityId].$valid) {
                                if (self.settings.save != null) {
                                    if (self.settings.save.onSave != undefined) {
                                        if (!self.settings.save.onSave(scope.master)) {
                                            return;
                                        }
                                    }

                                    if (self.settings.save.webMethod != undefined) {
                                        var parameters = {};
                                        parameters.entity = scope.master;

                                        ShowLoading();

                                        $http.post(self.settings.save.webMethod.method, JSON.stringify(parameters))
                                            .then(function (result) {
                                                HideLoading();
                                                var r = result.data != null ? result.data.replace("\"", "").replace("\"", "") : "OK";
                                                if (r != "OK") {
                                                    alertSucces(r);
                                                }
                                                $("#modal" + self.settings.entityId).modal("hide");
                                                if (self.settings.save.onSaveEnd != undefined) {
                                                    if (!self.settings.save.onSaveEnd(scope.master)) {
                                                        return;
                                                    }
                                                }
                                        
                                                if (self.settings.grid != undefined) {                                                  
                                                    self.settings.grid.options.RefreshFromEntity(null);                                                  
                                                }

                                            }, function (result) {

                                                HideLoading();
                                                alertErorr(result.data);

                                            });
                                    }
                                }
                            }
                        }
                        scope.closeEntity = function () {
                            $("#modal" + self.settings.entityId).modal("hide");
                        }
                        scope.upload = [];

                        angular.forEach(self.settings.properties, function (column, index) {
                            if (column.type == "lookup") {
                                scope["opt" + self.GetFieldPct(column)] = column.options;
                            };
                        });
                        scope.onFileSelectImport = function ($files) {

                            for (var i = 0; i < $files.length; i++) {
                                var $file = $files[i];
                                (function (index) {
                                    scope.upload[index] = $upload.upload({
                                        url: "/api/files/import", // webapi url
                                        method: "POST",
                                        data: { type: 'import' },
                                        file: $file
                                    }).progress(function (evt) {

                                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                    }).success(function (data, status, headers, config) {
                                        if (self.settings.grid.options.noShowMessageImport) {

                                            self.settings.grid.options.RemoveNomen = false;
                                            self.settings.grid.options.RefreshFromEntity(data.Path);
                                        }
                                        else {

                                            alertConfirm("Doriti sa stergeti vechiul nomenclator?",
                                                function () {
                                                    self.settings.grid.options.RemoveNomen = true;
                                                    self.settings.grid.options.RefreshFromEntity(data.Path);
                                                }, Sterge,
                                                function () {
                                                    self.settings.grid.options.RemoveNomen = false;
                                                    self.settings.grid.options.RefreshFromEntity(data.Path);
                                                });
                                        }



                                    }).error(function (data, status, headers, config) {
                                        console.log(data);
                                        alert(data);
                                    });
                                })(i);
                            }
                        };
                        scope.onFileSelect = function ($files, prop, propDisplay) {

                            for (var i = 0; i < $files.length; i++) {
                                var $file = $files[i];
                                (function (index) {
                                    scope.upload[index] = $upload.upload({
                                        url: "/api/files/upload", // webapi url
                                        method: "POST",
                                        data: { type: 'upload' },
                                        file: $file
                                    }).progress(function (evt) {

                                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                    }).success(function (data, status, headers, config) {

                                        console.log(data);
                                        setPropertiesObject(scope, prop, data.Path);
                                        if (propDisplay != undefined) {

                                            setPropertiesObject(scope, propDisplay, $files[0].name);
                                        }
                                        scope.$apply();

                                    }).error(function (data, status, headers, config) {
                                        console.log(data);
                                    });
                                })(i);
                            }
                        }

                        scope.abortUpload = function (index) {
                            scope.upload[index].abort();
                        }

                        scope.removedoc = function (prop) {

                            setPropertiesObject(scope, prop, "");
                        }

                        $compile(element.contents())(scope);

                    };

                    EditSetrio.prototype.Show = function (row) {
                        scope.master = row//row != null ? angular.copy(row) : null;
                        $("#modal" + this.settings.entityId).modal({ "show": true, backdrop: false });
                        if (this.settings.onShow != null) {
                            this.settings.onShow();
                        }
                    };

                    EditSetrio.prototype.fieldText = function (column) {
                        if (column.displayName != undefined) {
                            return column.displayName;
                        }
                        else {
                            return column.field;
                        }
                    };

                    EditSetrio.prototype.GetScope = function () {
                        return scope;
                    }

                    EditSetrio.prototype.GetTemplateColumn = function () {
                        return "<div style='padding-right: 15px !important;' class='col-md-" + (this.settings.columnWidth != undefined ? this.settings.columnWidth : "8") + "'>";
                    }

                    EditSetrio.prototype.CreatePopup = function (content) {
                        var result = '<div class="modal" id=\'modal' + this.settings.entityId + '\' role="dialog" tabindex="0" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
                        result += '<div class="modal-dialog ' + ('width-' + this.settings.popupSize != undefined ? this.settings.popupSize : '') + '"';
                        result += '<div class="modal-content">';
                        result += '<div class="modal-content ">';
                        result += '<div class="modal-header">';
                        result += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="closeEntity()" return false;">×</button>'
                        result += '<h3 id=\'myModalLabel' + this.settings.entityId + '\'>' + this.settings.popupText != undefined ? this.settings.popupText : "Adauga element" + '</h3>';
                        result += '</div>';
                        result += '<div class="modal-body row " id=\'divPopupContent' + this.settings.entityId + '\'>';
                        result += content;
                        result += '</div>';
                        result += '<div class="modal-footer">';
                        result += '<button class="btn btn-outline-primary" ng-click="closeEntity()" return false;">' + Renunta + '</button>';
                        if (this.settings.NoSave == null || this.settings.NoSave == false) {

                            result += '<button class="btn btn-primary" ng-click="saveEntity()" return false;" id="btnSalveaza" order="0"><i class="icon-save"></i>&nbsp;' + Salveaza + '</button>';
                        }
                        result += '</div>';
                        result += '</div></div></div></div>';
                        return result;
                    };

                    EditSetrio.prototype.CreateDatePicker = function (column) {
                        var self = this;
                        var dateView = column.dateView != null ? column.dateView : "day";
                        var str = '<div style="margin-bottom:15px" class="dropdown" >';
                        str += '<input  type="text" class="form-control" value="{{master.' + column.field + '}}" style="display:none" />';
                        str += '<a show-errors class="" id="' + self.settings.entityId + this.GetFieldPct(column) + '" role="button" data-toggle="dropdown" data-target="#" href="#">';
                        str += '<div class="input-group" >';
                        str += '<input  ng-readonly="!disabled"  ' + (column.disabled != false ? ' ng-disabled="disabled" ' : '') + self.GetValidator(column) + ' id="txt' + self.settings.entityId + this.GetFieldPct(column) + '"  name="txt' + self.settings.entityId + this.GetFieldPct(column) + '" type="date"  class="form-control" ' + (dateView == 'month' ? 'date-month' : 'date-input') + '  ng-Model="master.' + column.field + '" >';
                        str += '<span class=" input-group-addon"><i class="icon-calendar"></i></span>';
                        str += '</div>';
                        str += '</a>';

                        if (column.disabled != true) {

                            str += '<ul class="dropdown-menu" role="menu" ng-hide="disabled" >';
                            str += '<datetimepicker  data-ng-model="master.' + column.field + '" data-datetimepicker-config="{ dropdownSelector: \'#' + self.settings.entityId + this.GetFieldPct(column) + '\', startView:\'' + dateView + '\', minView:\'' + dateView + '\'}" />';
                            str += '</ul>';
                        }
                        str += '</div>';
                        return str;
                    };

                    EditSetrio.prototype.CreateEditor = function (column) {
                        var self = this;
                        var str = '<div show-errors > <textarea class="form-control"  ' + self.GetValidator(column) + ' ' + (column.type == 'editor' ? ' angulartexteditor' : '') + ' ng-model="master.' + column.field + '" id="' + self.settings.entityId + this.GetFieldPct(column) + '" name="' + self.settings.entityId + this.GetFieldPct(column) + '"></textarea></div>';

                        return str;
                    };

                    EditSetrio.prototype.GetFieldPct = function (column) {
                        return column.field != undefined ? column.field.split('.').join('') : column.field;
                    };

                    EditSetrio.prototype.CreateUpload = function (column) {
                        var self = this;

                        var strImg = "";
                        if (column.type == "uploadImage") {
                            strImg += '<ul class="ace-thumbnails" style="list-style-type: none;" id="img' + self.settings.entityId + this.GetFieldPct(column) + '"><li><a PictureId="img' + self.settings.entityId + this.GetFieldPct(column) + '" href="{{master.' + column.field + '}}" data-rel="colorbox">';
                            strImg += '<img height="100px", width="100px" alt="" src="{{master.' + column.field + '}}" /><div class="text"><div class="inner">Vizualizare</div></div></a><div class="tools"><a href="#"  ng-click="removedoc(\'master.' + column.field + '\')"><i class="icon-remove red"></i></a></div></li></ul>';
                        }
                        else {

                            strImg += "<a href='{{master." + column.field + "}}'>{{master." + column.field + "}}</a>";
                        }

                        var str = '<div class="well well-sm"><div  class="form-inline" > <div  show-errors> <input  ng-Model="master.' + column.field + '"   type="file" ' + self.GetValidator(column) + ' ng-file-select="onFileSelect($files,\'master.' + column.field + '\'' + (column.displayField != undefined ? (',\'master.' + column.displayField + '\'') : '') + ')"  id="inp' + self.settings.entityId + this.GetFieldPct(column) + '" name="inp' + self.settings.entityId + this.GetFieldPct(column) + '">';

                        str += '</div></div>';
                        if (column.editableText != undefined) {
                            str += "<input  class='col-md-12' ng-Model='master." + column.field + "' type='text'/>";
                        }
                        str += '<div ng-if="master!=null&&master.' + column.field + '!=null &&master.' + column.field + '!=undefined &&  master.' + column.field + '!=\'\'">' + strImg + '</div>';
                        str += ' <div class="clear-both"></div></div>';
                        return str;
                    };

                    EditSetrio.prototype.CreateCheckBox = function (column) {
                        var self = this;
                        var str = '<div class="form-inline">';
                        str += '<label class="ace">';
                        str += '<input class="ace activ" type="checkbox" ng-model="master.' + column.field + '" id="' + self.settings.entityId + this.GetFieldPct(column) + '">';
                        str += '<span class="lbl"></span>';
                        str += '</label>';
                        str += '<label for="' + self.settings.entityId + this.GetFieldPct(column) + '">' + self.fieldText(column) + '</label>';
                        str += '</div>';
                        return str;
                    };

                    EditSetrio.prototype.CreateLookup = function (column) {
                        var self = this;

                        var str = '<lookup  ' + (column.disabled == true ? "disabled='true' " : "") + self.GetValidator(column) + ' id="' + self.settings.entityId + this.GetFieldPct(column) + '" ng-model=" master.' + column.field + '" options="opt' + this.GetFieldPct(column) + '"></lookup>';
                        return str;
                    };


                    EditSetrio.prototype.CreateRadioList = function (column) {
                        var self = this;
                        var str = '<div class="table-grid" show-errors>';
                        if (column.options != null) {
                            var nr = 0;

                            str += '<div class="radio"   >';
                            angular.forEach(column.options, function (item, index) {

                                str += '<label style="margin-right:10px">';
                                str += '<input    class="ace" ' + self.GetValidator(column) + '   type="radio" ng-value="' + item.value + '" ng-model="master.' + column.field + '" name="' + self.settings.entityId + self.GetFieldPct(column) + '">';
                                str += '<span class="lbl">' + item.text + '</span>';
                                str += '</label>';


                                nr++;

                            });
                            str += '</div>';
                        }
                        str += "</div>";
                        return str;
                    };

                    EditSetrio.prototype.GetValidator = function (column) {
                        return column.validator != undefined ? column.validator : "";
                    };

                    var entity = new EditSetrio();
                    if (scope.id.autoCreate != false)
                        entity.Create(scope.id);
                    scope.id.Show = function (row) {
                        entity.Show(row);

                    }
                    scope.id.OpenImport = function () {

                        $("#inpImport" + entity.settings.entityId).trigger("click");
                    }

                    scope.id.Refresh = function () {

                        entity.Create(scope.id);

                    };

                    scope.getExternalScope = function () {
                        return scope.id.externalScope;
                    };



                    scope.id.Add = function () {
                        scope.$broadcast('show-errors-reset', "frm" + scope.id.entityId);
                        entity.Show(null);

                    }
                    scope.id.Show = function (row) {
                        entity.Show(row);

                    }
                    scope.id.SetEntity = function (entityServer) {

                        entity.EntityServer = entityServer;
                    }

                    scope.id.GetScope = function () {

                        return scope;
                    }

                }
            }
        });

}));


app.directive('showErrors', function ($timeout) {
    return {
        restrict: 'A',
        require: '^form',
        transclude: true,

        scope: {
            //inputName: '=',
            //id: "=",
            //formCtrl: "="
        },
        template: '<div  ng-if="hasError">' +
            '<span ng-repeat="(key,error) in getFormInput().$error" class="help-block"  ng-if="error" ' +
            '> {{getErorr(key)}}' +
            '</span>' +
            '</div>',
        link: function (scope, el, attrs, formCtrl, transclude) {

            transclude(scope.$parent, function (content) {
                el.prepend(content);
            });
            // find the text box element, which has the 'name' attribute
            var inputEl = el[0].querySelector("[name]");

            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);
            // get the name on the text box
            var inputName = inputNgEl.attr('name');
            var id = inputNgEl.attr('id');
            scope.inputName = inputName;
            scope.id = id;
            scope.formCtrl = formCtrl;
            scope.hasError = false;
            // only apply the has-error class after the user leaves the text box
            var blurred = false;
            inputNgEl.bind('blur', function () {
                blurred = true;
                if (!scope.reset) {
                    scope.hasError = formCtrl[inputName].$invalid;
                    el.toggleClass('has-error', formCtrl[inputName].$invalid);
                }
            });
            scope.getFormInput = function () {
                return formCtrl[inputName];
            }

            scope.getErorrff = function () {
                return scope.hasError;
            }

            scope.getCtrl = function () {
                return formCtrl;
            }
            scope.$watch(function () {
                if (inputName == null) {
                    scope.hasError = false;
                }
                return (inputName != undefined && formCtrl != undefined && formCtrl[inputName] != undefined ? formCtrl[inputName].$invalid : false);
            }, function (invalid) {
                if (!blurred && invalid) { return }
                if (!scope.reset) {
                    scope.hasError = invalid;
                    el.toggleClass('has-error', invalid);
                }
            });

            scope.$on('show-errors-check-validity', function (d, form) {

                scope.reset = false;
                if (inputName != null) {
                    scope.hasError = formCtrl[inputName].$invalid;
                    if (formCtrl.$name == form) {
                        if (scope.hasError) {
                            $("#" + id).focus();
                        }
                        el.toggleClass('has-error', formCtrl[inputName].$invalid);
                    }
                }
                else {
                    scope.hasError = false;
                }
            });
            scope.getErorr = function (key) {
                switch (key) {
                    case "required": return "Completati campul!"
                    case "email": return "Adresa de mail invalida!"
                    case "number": return "Valoare gresita. Introduceti un numar!";
                }
                return key;

            }
            scope.$on('show-errors-reset', function (d, form) {
                scope.reset = true;

                scope.hasError = false;
                if (form == formCtrl.$name) {
                    $("#" + id).val("");
                }
                $timeout(function () {
                    // 
                    el.removeClass('has-error');
                }, 0, false);
            });

        }
    }
});


app.directive(
    'dateInput',
    function (dateFilter) {
        return {
            require: 'ngModel',
            template: '<input type="date"></input>',
            replace: true,
            link: function (scope, elm, attrs, ngModelCtrl) {
                ngModelCtrl.$formatters.unshift(function (modelValue) {
                    if (modelValue == null) {
                        return "";
                    }
                    return dateFilter(modelValue, 'dd.MM.yyyy');
                });

                ngModelCtrl.$parsers.unshift(function (viewValue) {

                    var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
                    return new Date(viewValue.replace(pattern, '$3-$2-$1'));
                });
            },
        };
    });

app.directive(
    'dateMonth',
    function (dateFilter) {
        return {
            require: 'ngModel',
            template: '<input type="date"></input>',
            replace: true,
            link: function (scope, elm, attrs, ngModelCtrl) {
                ngModelCtrl.$formatters.unshift(function (modelValue) {
                    if (modelValue == null) {
                        return "";
                    }
                    return dateFilter(modelValue, 'MM.yyyy');
                });

                ngModelCtrl.$parsers.unshift(function (viewValue) {
                    return new Date(viewValue);
                });
            },
        };
    });