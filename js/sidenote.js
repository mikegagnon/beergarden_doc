/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Sidenote = {

  num_visible_columns: 2,

  min_column_width: 50,

  animationDuration: 600,

  // Copied from style.cs
  columnMargin: 10,
  columnPadding: 20,

  /**
   * nav_stack contains the pageIds for every column in the navigation stack.
   * the navigation stack starts off with just the main column
   */
  nav_stack: ["#main"],

  // nav_stack[left_column_index] == the pageId for the left-most visible
  // column
  left_column_index: 0,

  // maps pageId to the title for that column
  columnTitle: {
    "#main": "Top"
  },

  // maps columnLocation to columnId (as a number, not a string)
  columnLocationToIdNum: {},

  // maps columnLocation to columnId (as a string)
  columnLocationToId: function(columnLocation) {
    return "#column" + Sidenote.columnLocationToIdNum[columnLocation]
  },

  // the inverse of columnLocationToId
  columnIdToLocation: function(divIdNumber) {
    return parseInt(_(Sidenote.columnLocationToIdNum)
      .findKey(function(thisDivId) {
        return thisDivId == divIdNumber
      }))
  },

  columnLocationToPageId: function(columnLocation) {
    var nav_stack_index = Sidenote.left_column_index + columnLocation
    return Sidenote.nav_stack[nav_stack_index]
  },

  // the columnId for the spare column
  spareColumnId: function() {
    return Sidenote.columnLocationToId(Sidenote.num_visible_columns)
  },

  // returns the index into nav_stack where the element == pageId 
  getNavStackIndex: function(pageId) {
    return _(Sidenote.nav_stack).findIndex(function(c){ return c == pageId})
  },

  // returns an array containing the pageIds for every visible column that
  // contains content
  nonEmptyColumns: function() {
    return _(Sidenote.num_visible_columns)
      .times(function(n) {
        var columnIndex = Sidenote.left_column_index + n
        if (columnIndex < Sidenote.nav_stack.length) {
          return [Sidenote.nav_stack[columnIndex]]
        } else {
          return []
        }
      })
      .flatten()
      .value()
  },

  // the width of a single column, in pixels
  columnWidth: function() {
    var whitespace = ((Sidenote.columnMargin + Sidenote.columnPadding)
                      * 2
                      * Sidenote.num_visible_columns)
    return ($(window).width() - whitespace) / Sidenote.num_visible_columns
  },

  // the height of a column, in pixels
  columnHeight: function() {
    return ($(window).height()
            - $(".headerbox").height()
            - $("#breadcrumbs").height()
            - ((Sidenote.columnMargin + Sidenote.columnPadding)* 2))
  },

  // returns the left position (in pixels) for a specific columnLocation
  columnLeftPosition: function(columnLocation, columnWidth) {
    var whiteSpace = (Sidenote.columnMargin + Sidenote.columnPadding) * 2
    return columnLocation * (columnWidth + whiteSpace)
  },

  resizeColumns: function(){

    var height = Sidenote.columnHeight()
    var width = Sidenote.columnWidth()

    $("#column-container").css("height", height)

    _(Sidenote.num_visible_columns + 1)
      .times(function(columnLocation) {
        var columnId = Sidenote.columnLocationToId(columnLocation)
        var leftPosition = Sidenote.columnLeftPosition(columnLocation, width)
        $(columnId).css("height", height + "px")  
        $(columnId).css("width", width + "px")
        $(columnId).css("left", leftPosition + "px")
      })
  },

  /**
   * set's the url's #hashtag.
   *
   * the url's #hashtag encodes the state of the Sidenote view window using
   * the following format:
   #
   *    N#pageId1:pageTitle1#pageId2:pageTitle2#... 
   *
   * where N == the navStackIndex for the column in location 0
   */
  setHash: function() {
    
    var hashtag = _(Sidenote.nav_stack)
      .map(function(pageId) {
        var pageIdWithoutHash = pageId.slice(1)
        var pageTitle = encodeURIComponent(Sidenote.columnTitle[pageId])
        return pageIdWithoutHash + ":" + pageTitle
      })
      .join("#")

    hashtag = Sidenote.left_column_index + "#" + hashtag

    document.location.hash = hashtag

  },

  setBreadcrumbs: function() {

    var columns = Sidenote.nonEmptyColumns()
    var source = _(columns).last()

    nav_html = _(Sidenote.nav_stack)
      .map( function(columnId) {
        if (_(columns).contains(columnId)) {
          // do not linkify visible columns
          return "<b>" + Sidenote.columnTitle[columnId] + "</b>"
        } else {
          return ('<a href="' +
            "javascript:Sidenote.openColumn('" +
            source + "','" +
            columnId + "','" +
            Sidenote.columnTitle[columnId] + "')" + '">' +
            Sidenote.columnTitle[columnId] + "</a>")
        }
      })
      .join(" &#9654; ")

    $("#breadcrumbs").html(nav_html)

    Sidenote.setHash()
  },

  emptyColumnContent: function(columnId) {
    $(columnId).empty()
  },

  setColumnContent: function(columnId, pageId) {
    Sidenote.emptyColumnContent(columnId)
    $(pageId).clone().appendTo(columnId)
  },

  /**
   * Reaplces the Nth column (N == columnIndex) with content for pageId.
   * Also empties all columns after N.
   */
  animateReplaceColumn: function(columnLocation, pageId) {

    var columnId = Sidenote.columnLocationToId(columnLocation)
    Sidenote.setColumnContent(columnId, pageId)

    var deadColumnLocations =
      _.range(columnLocation + 1, Sidenote.num_visible_columns)

    _(deadColumnLocations)
      .forEach(function(deadColumnLocation) {
        var deadColumnId = Sidenote.columnLocationToId(deadColumnLocation)
        Sidenote.emptyColumnContent(deadColumnId)
      })

  },

  /**
   * animates columns sliding to the left or to the right.
   * one column slides into view (the spare column), and one column slides
   * out of view
   */
  animateSlide: function(
      // the list of pageIds that should be slid in, ordered by appearance
      
      // i.e. sub_stack[0] is the first pageId to be slid in
      sub_stack,

      // the column location where the spare column should start in the
      // animation
      spareColumnStartLocation,

      // a function that maps an old columnLocation to a new columnLocation
      // animateSlide will animate the column sliding from the old location to
      // the new location
      upateColumnLocationFunc,

      // every animation results in a new columnLocationToIdNum mapping
      // i.e. if columnLocation 0 is stored "#column1" before the animation,
      // then after the animation columnLocation 0 is stored in either
      // "#column0" or "#column2" (depending on whether the animation goes left
      // or right).
      //
      // updateColumnLocationToIdFunc is a function that maps an oldColumnIdNum
      // to a newColumnIdNum, as described above
      updateColumnLocationToIdFunc) {

    // Set the spare column to the page that is sliding in
    newPageId = sub_stack.shift()
    var spare_column = Sidenote.spareColumnId()
    Sidenote.setColumnContent(spare_column, newPageId)

    var height = Sidenote.columnHeight()
    var width = Sidenote.columnWidth()

    // position the spare column
    var new_column_start =
      Sidenote.columnLeftPosition(spareColumnStartLocation, width)
    $(spare_column).css("width", width + "px")
    $(spare_column).css("left", new_column_start + "px")
    $(spare_column).css("height", height)
  
    var num_columns = Sidenote.num_visible_columns

    /**
     * endPositions[columnId] == the left position of that column at the end
     * of the animation.
     */
    var endPositions = _(num_columns + 1)
      .times()
      .map(function(columnId) {
        var columnLocation = Sidenote.columnIdToLocation(columnId)
        var newLocation = upateColumnLocationFunc(columnLocation)
        return Sidenote.columnLeftPosition(newLocation, width)
      })
      .value()

    var numTransitionsDone = 0

    d3.selectAll(".column")
      .data(endPositions)
      .transition()
      .duration(Sidenote.animationDuration)
      .style("left", function(endPosition) {
        return endPosition + "px"
      })
      .each("end", function(){
        // this function is called every time an animation for a column
        // finishes
        numTransitionsDone += 1
        if (numTransitionsDone < num_columns + 1) {
          return
        }

        // now all the animations have finished

        // update columnLocationToIdNum
        _(num_columns + 1)
          .range()
          .forEach(function(columnLocation) {
            var oldColumnIdNum = Sidenote.columnLocationToIdNum[columnLocation]
            var newColumnIdNum = updateColumnLocationToIdFunc(oldColumnIdNum)
            Sidenote.columnLocationToIdNum[columnLocation] = newColumnIdNum
          })

        if (sub_stack.length >= 1) {
          Sidenote.animateSlide(
            sub_stack,
            spareColumnStartLocation,
            upateColumnLocationFunc,
            updateColumnLocationToIdFunc)
        }

      })

  },

  /**
   * slide all columns to the right, sliding in previously invisible column
   * from the left
   *
   * sub_stack is the subset of of nav_stack that contains all columns that
   * need to be slid in from the left, specified in the same order as in
   * nav_stack
   */
  animateSlideRight: function(sub_stack) {
    var num_columns = Sidenote.num_visible_columns

    Sidenote.animateSlide(
      sub_stack = _(sub_stack).reverse().value(),
      spareColumnStartLocation = -1,
      upateColumnLocationFunc = function(oldColumnLocation) {
        return (oldColumnLocation + 1) % (num_columns + 1)
      },
      updateColumnLocationToIdFunc = function(oldColumnIdNum) {
        var newColumnIdNum = oldColumnIdNum - 1
        if (newColumnIdNum < 0) {
          newColumnIdNum = num_columns
        }
        return newColumnIdNum
      })
  },

  /**
   * slide all columns to the left, sliding in previously invisible column
   * from the right
   *
   * sub_stack is the subset of of nav_stack that contains all columns that
   * need to be slid in from the right, specified in the same order as in
   * nav_stack
   */
  animateSlideLeft: function(sub_stack) {
    var num_columns = Sidenote.num_visible_columns

    Sidenote.animateSlide(
      sub_stack = sub_stack,
      spareColumnStartLocation = num_columns,
      upateColumnLocationFunc = function(oldColumnLocation) {
        return oldColumnLocation - 1
      },
      updateColumnLocationToIdFunc = function(oldColumnIdNum) {
        return (oldColumnIdNum + 1) % (num_columns + 1)
      })
  },

  
  reopenColumn: function(toPageId) {
    var toIndex = Sidenote.getNavStackIndex(toPageId)

    if (toIndex < 0) {
      alert("toIndex < 0 in openColumn")
    }
    // if we need to go back
    else if (toIndex < Sidenote.left_column_index) {
     
      // the pageIds that should be slid in from the left
      var substack = _(Sidenote.nav_stack)
        .slice(toIndex, Sidenote.left_column_index)
        .value()

      Sidenote.left_column_index = toIndex

      Sidenote.animateSlideRight(substack)

    }
    // if we need to go forward
    else {
      var nonEmptyColumns = Sidenote.nonEmptyColumns()
      var rightMostPageId = _(nonEmptyColumns).last()
      var rightMostColumnIndex = Sidenote.getNavStackIndex(rightMostPageId)

      var firstColumn = rightMostColumnIndex + 1

      if (firstColumn >= Sidenote.nav_stack.length) {
        alert("firstColumn >= Sidenote.nav_stack.length in openColumn")
      }

      var substack = _(Sidenote.nav_stack)
        .slice(firstColumn, toIndex + 1)
        .value()

      Sidenote.left_column_index += substack.length
      Sidenote.animateSlideLeft(substack)
    }

  },

  /**
   * dropping all items in nav_stack that appear after lastPageId, then
   * push newPageId on to the stack.
   */
  dropAndPushNavStack: function(lastPageId, newPageId) {
    var numNavStackItemsToKeep = Sidenote.getNavStackIndex(lastPageId) + 1

    Sidenote.nav_stack = _(Sidenote.nav_stack)
      .take(numNavStackItemsToKeep)
      .value()

    Sidenote.nav_stack.push(newPageId)
  },

  /**
   * Every time the user clicks a Sidenote link, this function is called to
   * handle the click.
   *
   * fromPageId: the pageId for the column where the click came from
   *             Note: all breadcrumb links have fromPageId == to right-most
   *             visible column
   * toPageId:   the destination of the click
   * toText:     the link text of the hyperlink that was clicked
   */
  openColumn: function(fromPageId, toPageId, toText) {

    var nonEmptyColumns = Sidenote.nonEmptyColumns()

    // if the destination is already visible, you don't need to open the column
    if (_(nonEmptyColumns).contains(toPageId)) {
      return
    }

    // which columnLocation the from-click came from
    var fromColumnLocation = _(nonEmptyColumns)
      .findIndex(function(pageId) {
        return pageId == fromPageId
      })

    if (fromColumnLocation < 0) {
      alert("fromColumnLocation < 0 in openColumn")
    }
    // if the destination is in the nav_bar stack, but it's not visible
    else if (_(Sidenote.nav_stack).contains(toPageId)) {
      Sidenote.reopenColumn(toPageId)
    }
    // if the click comes from one of the left columns
    else if (fromColumnLocation < Sidenote.num_visible_columns - 1) {
      Sidenote.dropAndPushNavStack(fromPageId, toPageId)
      Sidenote.animateReplaceColumn(fromColumnLocation + 1, toPageId)
    }
    // if the click comes from the right column and isn't already in the 
    // breadcrumbs
    else {
      Sidenote.dropAndPushNavStack(fromPageId, toPageId)
      Sidenote.left_column_index += 1
      Sidenote.animateSlideLeft([toPageId])
    }

    if (!(toPageId in Sidenote.columnTitle)) {
      Sidenote.columnTitle[toPageId] = toText
    }

    Sidenote.setBreadcrumbs()
  },

  loadDefaultView: function() {
    Sidenote.initializeColumns(Sidenote.nav_stack, Sidenote.left_column_index)
  },

  // idempotent
  createColumnDiv: function(columnId) {
    if ($("#" + columnId).length == 0) {
      $("#column0")
        .clone()
        .attr("id", columnId)
        .appendTo("#column-container")
    }
  },

  /**
   * the inverse of setHash.
   * See documentation for setHash. 
   */
  loadStateFromUrl: function() {
    var firstHashIndex = document.URL.indexOf('#')
    if (firstHashIndex < 0) {
      Sidenote.loadDefaultView()
      return
    }
    var hashtag = document.URL.substr(firstHashIndex + 1)
    var columns = hashtag.split("#")

    if (columns.length < 2) {
      Sidenote.loadDefaultView()
      return
    }

    var left_column_index = parseInt(columns[0])
    if (isNaN(left_column_index)) {
      Sidenote.loadDefaultView()
      return
    }

    var nav_stack = _(columns)
      .tail()
      .map(function(column) {
        var parts = column.split(":")
        if (parts.length != 2) {
          return {
            pageId: "",
            title: ""
          }
        } else {
          return {
            pageId: "#" + parts[0],
            title: decodeURIComponent(parts[1])
          }
        }
      })
      .value()


    var validColumns = _(nav_stack)
      .every(function(column){
        return $(column.pageId).length > 0
      })

    if (!validColumns ||
        nav_stack.length <= 1 ||
        nav_stack[0].pageId != "#main") {
      Sidenote.loadDefaultView()
      return
    }

    _(nav_stack)
      .forEach(function(column) {
        Sidenote.columnTitle[column.pageId] = column.title
      })

    nav_stack = _(nav_stack)
      .map(function(column) {
        return column.pageId
      })
      .value()

    Sidenote.initializeColumns(nav_stack, left_column_index)

  },

  /**
   * assumes the following are defined:
   */
  initializeColumns: function(nav_stack, left_column_index) {

    Sidenote.nav_stack = nav_stack
    Sidenote.left_column_index = left_column_index

    // initialize columnLocationToIdNum and create the column divs
    Sidenote.columnLocationToIdNum = {0: 0}
    _.times(Sidenote.num_visible_columns, function(n) {
      var columnLocation = n + 1
      var columnId = "column" + columnLocation
      Sidenote.createColumnDiv(columnId)
      Sidenote.emptyColumnContent("#" + columnId)
      Sidenote.columnLocationToIdNum[columnLocation] = columnLocation
    })

    var nonEmptyColumns = Sidenote.nonEmptyColumns()

    _(nonEmptyColumns.length)
      .range()
      .forEach(function(columnLocation) {
        var pageId = nonEmptyColumns[columnLocation]
        var columnId = Sidenote.columnLocationToId(columnLocation)
        Sidenote.setColumnContent(columnId, pageId)
      })
  },

  /**
   * Add one more visible column
   * TODO: provide a good animation
   */
  more: function() {
    Sidenote.num_visible_columns += 1

    if (Sidenote.columnWidth() < Sidenote.min_column_width) {
      Sidenote.num_visible_columns -= 1
      return
    }

    var left_column_index = Sidenote.left_column_index
    if (left_column_index > 0) {
      left_column_index -= 1
    }

    Sidenote.initializeColumns(Sidenote.nav_stack, left_column_index)
    Sidenote.setBreadcrumbs()
    Sidenote.resizeColumns()
  },

  /**
   * remove a visible column
   * TODO: provide a good animation
   */
  less: function() {

    if (Sidenote.num_visible_columns == 1) {
      return
    }

    var numEmptyColumns = (Sidenote.num_visible_columns
                           - Sidenote.nonEmptyColumns().length)

    $("#column" + Sidenote.num_visible_columns).remove()

    Sidenote.num_visible_columns -= 1

    var left_column_index = Sidenote.left_column_index

    if (numEmptyColumns == 0) {
      left_column_index += 1
    }

    Sidenote.initializeColumns(Sidenote.nav_stack, left_column_index)
    Sidenote.setBreadcrumbs()
    Sidenote.resizeColumns()
  },

}

window.onload = function() {

  Sidenote.loadStateFromUrl()
  Sidenote.setBreadcrumbs()
  $(window).resize(Sidenote.resizeColumns)
  Sidenote.resizeColumns()
}
