var the_canvas = document.getElementById("the_canvas");
var the_scratch_pad = document.getElementById("the_scratch_pad");
var cx = the_canvas.getContext("2d");
var canvas_width = parseInt(the_canvas.getAttribute("width"));
var canvas_height = parseInt(the_canvas.getAttribute("height"));
var tile_stroke_color = "black";

var BOARD_SIZE = 10;
var TILE_SIZE = Math.floor(
    Math.min(canvas_width, canvas_height) / BOARD_SIZE);
var STATIC_TILE_SIZE = 100;
var STATIC_TILE_CENTER_SIZE = 15;
var NORTH = 0;
var EAST = 1;
var SOUTH = 2;
var WEST = 3;
var DIRS = [NORTH, EAST, SOUTH, WEST];
var PRINTED_DIRS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
var TWO_PI = 2 * Math.PI;

// index rotate 90 degree clockwise and get new index
var TRANSFORMATIONS = [0, 8, 1, 9, 
                       2, 10, 3, 11, 
                       4, 12, 5, 13, 
                       6, 14, 7, 15]; 

var game_state = {};

var get_random_tile = function () {
    var tile = {};
    for(var i = 0; i < DIRS.length; i++) {
        var dir = DIRS[i];
        tile[dir] = Math.random() > 0.5;
    }
    return tile;
};

var init_game_board_randomly = function () {
    game_state.board = [];    
    for(var i = 0; i < BOARD_SIZE; i++) {
        var row = [];
        for(var j = 0; j < BOARD_SIZE; j++) {
            row.push(get_random_tile());
        }
        game_state.board.push(row);
    }
};

var tile_canvas_id = function (index) { 
    var index_str = index < 10 ? "0" + index : "" + index;
    return "tile_" + index_str;
};

var create_tile_canvas = function (index) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", STATIC_TILE_SIZE);
    canvas.setAttribute("height", STATIC_TILE_SIZE);
    canvas.setAttribute("id", tile_canvas_id(index));
    canvas.setAttribute("style", "border:1px solid #c3c3c3;");
    the_scratch_pad.appendChild(canvas);
    return canvas.getContext("2d");
};

var explode_index = function (index) {
    var n = index;
    var dirs = [];
    for(var i = 0; i < DIRS.length; i++) {
        dirs.unshift(n & 1);
        n = n >> 1;
    }
    return dirs;
};

var explode_tile = function (index) {
    var arr = explode_index(index);
    var tile = {};
    for(var i = 0; i < DIRS.length; i++) {
        var dir = DIRS[i];
        if(arr[i] == 1)
            tile[dir] = true;
        else
            tile[dir] = false;
    }
    return tile;
}

var implode_index = function (index_arr) {
    var n = 0;
    for(var i = 0; i < index_arr.length; i++)
        n = (n << 1) | (index_arr[i]);
    return n;
};

var implode_tile = function (tile) {
    var arr = [];
    for(var i = 0; i < DIRS.length; i++) {
        var dir = DIRS[i];
        if(tile[dir])
            arr.push(1);
        else
            arr.push(0);
    }

    return implode_index(arr);
};

var center_circle = function (lcx) {
    var half = STATIC_TILE_SIZE / 2;    
    lcx.beginPath();
    lcx.arc(half, half, STATIC_TILE_CENTER_SIZE, 0, TWO_PI);
    lcx.stroke();
};

var quarter_arc = function (lcx, pos) {
    var half = STATIC_TILE_SIZE / 2;    
    lcx.beginPath();
    switch(pos) {
        case "top-left":
        lcx.arc(0, 0, half, 0, Math.PI * 0.5);
        break;
        case "bottom-left":
        lcx.arc(0, STATIC_TILE_SIZE, half, Math.PI * 1.5, TWO_PI);
        break;
        case "top-right":
        lcx.arc(STATIC_TILE_SIZE, 0, half, Math.PI * 0.5, Math.PI);
        break;
        case "bottom-right":
        lcx.arc(STATIC_TILE_SIZE, STATIC_TILE_SIZE, half, 
                Math.PI, Math.PI * 1.5);
        break;
    }
    lcx.stroke();
};

var draw_line = function (lcx, x1, y1, x2, y2) {
    lcx.beginPath();
    lcx.moveTo(x1, y1);
    lcx.lineTo(x2, y2);
    lcx.stroke();
};

var make_tile = function (index, fn) {
    return function () {
        var lcx = create_tile_canvas(index);
        var half = STATIC_TILE_SIZE / 2;
        var lo = STATIC_TILE_SIZE / 2 - STATIC_TILE_CENTER_SIZE;
        var hi = STATIC_TILE_SIZE / 2 + STATIC_TILE_CENTER_SIZE;

        lcx.lineWidth = 10;
        lcx.lineCap = "round";
        lcx.strokeStyle = tile_stroke_color;
        fn(lcx, half, lo, hi);
    };
};

var tile_image_painters = [];

tile_image_painters[0] = make_tile(0, function(lcx, half, lo, hi) {
    draw_line(lcx, lo, lo, hi, hi);
    draw_line(lcx, lo, hi, hi, lo);
});

tile_image_painters[1] = make_tile(1, function(lcx, half, lo, hi) {
    center_circle(lcx);
    draw_line(lcx, lo, half, 0, half);
});

tile_image_painters[2] = make_tile(2, function(lcx, half, lo, hi) {
    center_circle(lcx);
    draw_line(lcx, half, hi, half, STATIC_TILE_SIZE);
});

tile_image_painters[3] = make_tile(3, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "bottom-left");
});

tile_image_painters[4] = make_tile(4, function(lcx, half, lo, hi) {
    center_circle(lcx);
    draw_line(lcx, hi, half, STATIC_TILE_SIZE, half);
});

tile_image_painters[5] = make_tile(5, function(lcx, half, lo, hi) {
    draw_line(lcx, 0, half, STATIC_TILE_SIZE, half);
});

tile_image_painters[6] = make_tile(6, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "bottom-right");
});

tile_image_painters[7] = make_tile(7, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "bottom-left");
    quarter_arc(lcx, "bottom-right");
});

tile_image_painters[8] = make_tile(8, function(lcx, half, lo, hi) {
    center_circle(lcx);
    draw_line(lcx, half, 0, half, lo);
});

tile_image_painters[9] = make_tile(9, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "top-left");
});

tile_image_painters[10] = make_tile(10, function(lcx, half, lo, hi) {
    draw_line(lcx, half, 0, half, STATIC_TILE_SIZE);
});

tile_image_painters[11] = make_tile(11, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "top-left");
    quarter_arc(lcx, "bottom-left");
});

tile_image_painters[12] = make_tile(12, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "top-right");
});

tile_image_painters[13] = make_tile(13, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "top-left");
    quarter_arc(lcx, "top-right");
});

tile_image_painters[14] = make_tile(14, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "top-right");
    quarter_arc(lcx, "bottom-right");
});

tile_image_painters[15] = make_tile(15, function(lcx, half, lo, hi) {
    quarter_arc(lcx, "top-left");
    quarter_arc(lcx, "bottom-left");
    quarter_arc(lcx, "top-right");
    quarter_arc(lcx, "bottom-right");    
});


var get_meaning_of_index = function (index) {
    var tile = explode_tile(index);
    var meaning = [];
    for(var i = 0; i < DIRS.length; i++) {
        var dir = DIRS[i];
        if(tile[dir])
            meaning.push(PRINTED_DIRS[i]);
    }
    return meaning;
};

var print_meanings_of_indices = function () {
    for(var i = 0; i < 16; i++) {
        console.log(i);
        console.log(get_meaning_of_index(i));
    }
};

var create_tile_images = function (index) {
    for(var i = 0; i < tile_image_painters.length; i++)
        tile_image_painters[i]();
};

var render_board = function (board) {
    if(!board)
        board = game_state.board; // default

    cx.clearRect(0, 0, the_canvas.width, the_canvas.height);

    for(var x = 0; x < board.length; x++)
        for(var y = 0; y < board[x].length; y++) {
            var rx = x * TILE_SIZE;
            var ry = y * TILE_SIZE;
            var tile = board[x][y];
            var index = implode_tile(tile);
            var tile_id = tile_canvas_id(index);
            var tile_canvas = document.getElementById(tile_id);
            cx.drawImage(tile_canvas, rx, ry, TILE_SIZE, TILE_SIZE);
        }

    render_side_panel();
}

var process_click = function (event) {
    var rx = event.pageX - the_canvas.offsetLeft;
    var ry = event.pageY - the_canvas.offsetTop;
    var x = Math.floor(rx / TILE_SIZE);
    var y = Math.floor(ry / TILE_SIZE);

    if(x < 0 || x >= BOARD_SIZE ||
       y < 0 || y >= BOARD_SIZE) 
        return;

    rotate_tile(game_state.board, x, y);
    render_board();
    
    if(game_finished()) 
        show_game_finish();
};

var rotate_tile = function(board, x, y) {
    var old_index = implode_tile(board[x][y]);
    var new_index = TRANSFORMATIONS[old_index];
    board[x][y] = explode_tile(new_index);    
}

var map_adjacencies = function (board, fn) {
    var result = [];
    var x, y;
    for(x = 0; x < BOARD_SIZE; x++)
        for(y = 0; y < BOARD_SIZE; y++) {
            if(x < BOARD_SIZE - 1)
                result.push(fn(board[x][y], board[x+1][y], true));
            if(y < BOARD_SIZE - 1)
                result.push(fn(board[x][y], board[x][y+1], false));
        }
    return result;
};

var sum = function (arr) {
    var result = 0;
    for(var i = 0; i < arr.length; i++)
        result += arr[i];
    return result;
}

var unmatch_adjacencies_count = function (board) {
    if(!board)
        board = game_state.board;

    var inner_unmatch_adjs = map_adjacencies(board, function (tile1, tile2, horizontal) {
        if(horizontal)
            return (tile1[EAST] != tile2[WEST]) ? 1 : 0;
        else
            return (tile1[SOUTH] != tile2[NORTH]) ? 1 : 0;
    });

    var inner_count = sum(inner_unmatch_adjs);

    var outer_count = 0;
    var i;

    for(i = 0; i < BOARD_SIZE; i++) {
        if(board[i][0][NORTH])
            outer_count ++;
        if(board[i][BOARD_SIZE - 1][SOUTH])
            outer_count ++;
        if(board[0][i][WEST])
            outer_count ++;
        if(board[BOARD_SIZE - 1][i][EAST])
            outer_count ++;
    }

    return inner_count + outer_count;
}

var get_empty_tile = function () {
    var tile = {};
    for(var i = 0; i < DIRS.length; i++) {
        var dir = DIRS[i];
        tile[dir] = false;
    }
    return tile;
}

var init_game_board_empty = function () {
    game_state.board = [];    
    for(var i = 0; i < BOARD_SIZE; i++) {
        var row = [];
        for(var j = 0; j < BOARD_SIZE; j++) {
            row.push(get_empty_tile());
        }
        game_state.board.push(row);
    }
};

var is_empty_tile = function (tile) {
    var empty_p = true;
    for(var i = 0; i < DIRS.length; i++) {
        var dir = DIRS[i];
        if(tile[dir])
            empty_p = false;
    }
    return empty_p;
}

var make_good_board = function () {
    function link(tile1, tile2, horizontal) {
        if(horizontal) {
            tile1[EAST] = true;
            tile2[WEST] = true;
        } else {
            tile1[SOUTH] = true;
            tile2[NORTH] = true;
        }        
    }

    // two steps, first step: randomly set links between adjacent tiles.
    map_adjacencies(game_state.board, function (tile1, tile2, horizontal) {
        if(Math.random() < 0.65) 
            link(tile1, tile2, horizontal);
    });

    // second step: detect empty tiles, make some link on them.
    map_adjacencies(game_state.board, function (tile1, tile2, horizontal) {
        if(is_empty_tile(tile1) || is_empty_tile(tile2)) 
            link(tile1, tile2, horizontal);
    });
}

var shuffle_game_board = function (board) {
    if(!board)
        board = game_state.board;

    for(var x = 0; x < BOARD_SIZE; x++)
        for(var y = 0; y < BOARD_SIZE; y++) {
            var times = Math.random() * 3;
            for(var t = 0; t < times; t++)
                rotate_tile(board, x, y);
        }            
}

var game_finished = function () {
    return (unmatch_adjacencies_count() == 0);
}

var show_game_finish = function () {
    tile_stroke_color = "blue";
    the_scratch_pad.innerHTML = "";
    create_tile_images();
    render_board();
    tile_stroke_color = "black";
    the_scratch_pad.innerHTML = "";
    create_tile_images();
}

var render_side_panel = function () {
    document.getElementById("unmatched").innerHTML = unmatch_adjacencies_count();
}

var reset_game = function () {
    var size = parseInt(document.getElementById("resetter_number").value);

    if(isNaN(size) || !(size >= 2 && size <= 20)) {
        document.getElementById("resetter_message").innerHTML = "should be between 2 and 20";
        return;
    }

    document.getElementById("resetter_message").innerHTML = "";

    BOARD_SIZE = size;
    TILE_SIZE = Math.floor(
        Math.min(canvas_width, canvas_height) / BOARD_SIZE);

    init_game_board_empty();
    make_good_board();
    shuffle_game_board();


    create_tile_images();

    render_board();
}

// ============== main ==============================

the_canvas.addEventListener("click", process_click, false);
document.getElementById("resetter_button").addEventListener(
    "click", reset_game, false);

reset_game();