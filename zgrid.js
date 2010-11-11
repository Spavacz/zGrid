/*
 * zGrid for jQuery - Tables Gone Wild
 *
 * Copyright (c) 2010 Patryk Grandt (spav.com.pl)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2010-11-10 23:40:43 +0200 (Wed, 11 Nov 2010) $
 */
(function($){
	/*
	 * add grid to element
	 * 
	 * @param t - element html table
	 * @param p - options
	 */
	$.addZGrid = function(t,p) {
		// checking if grid is not already initialized
		if( t.grid ) return false;


		// defaults
		p = $.extend({
			gridId: 0,
			url: false, // rest url
			autoload: true,
			pageTotal: 1,
			page: 1,
			pageLimit: 10,
			checkboxes: false,
			controls: false,
			pageTag: 'page',
			pageLimitTag: 'limit',
			sortTag: 'sort',
			orderTag: 'order',
			sort: 'id',
			order: 'desc',
			cols: [],
			bulk: [],
			onLoad: function(){},
			onBulk: function(){}
		}, p);
		
		// grid class
		var g = {
			// row list
			rows: [],
			// add new row to grid
			addRow:	function(data){
				var row = $('<tr></tr>');

				data.row = row;
				g.rows[g.rows.length] = data;
				
				// checkboxes
				if( p.checkboxes ) {
					row.append('<td><input class="grid" value="' + data.cols.id + '" type="checkbox"/></td>');
				}
				
				var col;
				for( var i in p.cols) {
					col = $('<td></td>');
					var colData = data.cols[p.cols[i].id];
					switch( p.cols[i].type )
					{
						case 'head':
							col.append('<h5>' + colData + '</h5>');
							break;
						case 'url':
							col.append('<a href="' + colData + '">' + colData + '</a>');
							break;
						case 'img':
							col.attr('class', 'text-center');
							col.append('<img src="' + colData + '"/>');
							break;
						case 'string':
						default:
							col.append(colData);
					}
					row.append(col);
				}
				
				if( p.controls ) {
					col = $('<td></td>');
					for( var i in data.ctrl ) {
						var ctrlData = data.ctrl[i];
						//this.addControl(col,data.ctrl[i]);
						col.append('<a title="' + ctrlData.label + '" href="' + ctrlData.url + '" class="' + ctrlData.css + '" name="' + data.cols.id +
								'"><img alt="' + ctrlData.label + '" src="' + ctrlData.img + '"/></a> ');
					}
					row.append(col);
				}

				t.tbody.append(row);
			},
			deleteRow: function( id ) {
				for( var i in g.rows ) {
					if( g.rows[i].cols.id == id ) {
						break;
					}
				}
				g.rows[i].row.fadeOut('slow', function(){
					$(this).remove();
				});
				delete g.rows[i];
			},
			// populating grid with data
			populate: function( data ){
				t.tbody.empty();
				g.rows = [];
				for( var i in data ) {
					g.addRow(data[i]);
				}
			},
			// fetching data from server
			loadData: function(){
				if( p.url ) { // tylko jesli ustawiony jest url
					var getData = p.sortTag + '=' + p.sort + '&' + p.orderTag + '=' + p.order + 
						'&' + p.pageLimitTag + '=' + p.pageLimit;
					if(p.page > 1) {
						getData += '&' + p.pageTag + '=' + p.page;
					}
					
					jQuery.getJSON( p.url + '?' + getData, function(result, textData) {
						if(result.success) {
							g.populate( result.data );
							// table stylin
							if( typeof($('.tooltip-enabled a[title]').tipsy) == 'function' )
							{
								$('.tooltip-enabled a[title]').tipsy({gravity: 's'});
							}
							$("tr:even").addClass("alt");
							// fire event
							p.onLoad();
						}
					});
				}
			},
			// marking sortable headers
			sortMark: function(){
				for( var i in p.cols ) {
					if( p.cols[i].id == p.sort ) {
						var id = i;
					}
					if( p.cols[i].sortable ){
						p.cols[i].dom.attr('class', 'sortable');
					}
				}
				p.cols[id].dom.attr('class', 'sortable sort-'+p.order);
			},
			// redrawing pagination
			refreshPagination: function(){
				var pagination = $('.pagination');
				pagination.empty();
				if( p.page > 1 ) {
					var first = $('<a name="page-1" href="#page-1" title="First Page">« First</a>');
					var prev = $(' <a name="page-' + (p.page - 1) + '" href="#page-' + (p.page - 1) + '" title="Previous Page">« Previous</a>');
					pagination.append(first);
					pagination.append(prev);
				}
				for(var i = 1; i <= p.pageTotal; i++) {
					var strona = $('<a name="page-' + i + '" title="' + i + '" href="#page-' + i + 
							'" class="number' + (p.page == i ? ' current' : '') + '">' + i + '</a>');
					pagination.append(strona);
				}
				if( p.page < p.pageTotal ) {
					var next = $(' <a name="page-' + (p.page + 1) +'" href="#page-' + (p.page + 1) + '" title="Next Page">Next »</a>');
					var last = $(' <a name="page-' + p.pageTotal + '" href="#page-' + p.pageTotal + '" title="Last Page">Last » </a>');
					pagination.append(next);
					pagination.append(last);
				}
				// on click
				pagination.children('a[name]').click( function(e) {
					g.loadPage( parseInt(e.currentTarget.name.substr(5)) );
					g.refreshPagination();
					return false;
				});
			},
			// load specific page
			loadPage: function(i) {
				p.page = i;
				g.loadData();
			}
		};
		
		/* column width */
		if(p.checkboxes) {
			$(t).append($('<col></col>'));
		}
		for(var i in p.cols) {
			var col = $('<col></col>');
			if( p.cols[i].width ) {
				col.attr('width', p.cols[i].width);
			}
			$(t).append(col);
		}
		if(p.controls) {
			$(t).append($('<col width="10%"></col>'));
		}

		/* table header */
		var thead = $('<thead></thead>');
		var row = $('<tr></tr>');
		// checkboxes
		if( p.checkboxes ) {
			var checkall = $('<input type="checkbox" class="check-all"/>');
			checkall.click( function(e) {
				if( $(this).attr('checked') ) {
					$('input.grid:checkbox').attr('checked', true);
				} else {
					$('input.grid:checkbox').attr('checked', false);
				}
			});
			var col = $('<th></th>');
			col.append(checkall);
			row.append(col);
		}
		// data columns
		for( var i in p.cols ) {
			var col = $('<th></th>');
			if( p.cols[i].sortable )
			{
				col = $('<th class="sortable"></th>');
				var link = $('<a name="th-'+ i +'" href="#sort-by-' + p.cols[i].id + '">' + p.cols[i].label + '</a>');
				link.click( function(e){
					e.stopPropagation();
					var index = this.name.substr(3);
					var change = (p.sort != p.cols[index].id);
					p.sort = p.cols[index].id;
					if( p.order != 'asc' ) {
						p.order = 'asc';
					} else {
						p.order = 'desc';
					}
					if(change) p.order = 'desc';
					
					g.sortMark();
					g.loadData();
					return false;
				});
				col.append(link);
			} 
			else {
				col.append(p.cols[i].label);
			}
			p.cols[i].dom = col;
			row.append(col);
		}
		if( p.controls ) {
			row.append($('<th></th>'));
		}
		thead.append(row);
		
		
		/* table body */
		var tbody = $('<tbody class="tooltip-enabled"></tbody>');
		
		/* table footer */
		var tfoot = $('<tfoot></tfoot>');
		var row = $('<tr class="alt"></tr>');
		
		var colspan = p.cols.length + (p.checkboxes ? 1 : 0) + (p.controls ? 1 : 0);
		var td = $('<td colspan="' + colspan + '"></td>');
		
		// bulk actions
		if( p.bulk.length ) {
			var select = $('<select name="bulk-action"></select>');
			select.append($('<option value="0">Choose an action...</option>'));
			for( var i in p.bulk ) {
				select.append( $('<option value="' + p.bulk[i].action + '">' + p.bulk[i].label + '</option>') );
			}
			var bulk = $('<div class="bulk-actions"></div>');
			bulk.append(select);
			var submit = $('<a class="button" href="#bulk-action">Apply to selected</a>');
			bulk.append(submit);
			submit.click( function(e) {
				e.stopPropagation();
				var select = $(this).parent().children('select');
				var selected = $('input.grid:checked');
				if(selected.length && select.val() != '0') {
					p.onBulk(select.val(),selected);
				}
				return false;
			});
			td.append(bulk);	
		}
		
		// pagination
		if( p.pageTotal > 1 ){
			var pagination = $('<div class="pagination"></div>');
			td.append(pagination);
		}
		
		row.append(td);
		tfoot.append(row);
		
		/* table */
		$(t).append(thead);
		$(t).append(tbody);
		$(t).append(tfoot);
		
		//make grid functions accessible
		t.thead = thead;
		t.tbody = tbody;
		t.tfoot = tfoot;
		t.p = p;
		t.grid = g;
		
		// pagination draw
		if( p.pageTotal > 1 ){
			g.refreshPagination();			
		}
		// load data
		if (p.url && p.autoload) {
			g.loadData();
		}
		
		$(t).show(); //show if hidden
		
		return t;
	};

	// document ready marker
	var docloaded = false;
	$(document).ready(function () {docloaded = true;} );

	/*
	 * Adding zGrid to table
	 * 
	 * p - options
	 */ 
	$.fn.zGrid = function(p) {
		return this.each( function(k) {
			p.gridId = k;
			if (!docloaded) {
				$(this).hide();
				var t = this;
				$(document).ready( function (){
					$.addZGrid(t,p);
				} );
			} else {
				$.addZGrid(this,p);
			}
		});
	};
	/*
	 * Deleting row from grid
	 *
	 * id - row id
	 */
	$.fn.zGridDeleteRow = function( id ) { //function to update general options
		return this.each( function() {		
			this.grid.deleteRow(id);
		});

	};
})(jQuery);