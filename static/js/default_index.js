// Based off default_index.js from lecture10-2018 branch
// This is the js for the hw3/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };
    
    function get_checklist_url(start_idx, end_idx) {
        // console.log('get_checklist_url');
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return checklist_url + "?" + $.param(pp);
    }
    
    self.get_checklists = function () {
        // console.log("get_checklist");
        $.getJSON(get_checklist_url(0, 10), function (data) {
            self.vue.checklists = data.checklists;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };
    
    self.get_more = function () {
        var num_checklists = self.vue.checklists.length;
        // console.log(num_checklists);
        $.getJSON(get_checklist_url(num_checklists, num_checklists + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.checklists, data.checklists);
        });
    };
    
    self.add_checklist_button = function () {
        // The button to add a checklist has been pressed.
        self.vue.is_adding_checklist = !self.vue.is_adding_checklist;
    };

    self.add_checklist = function () {
        // The submit button to add a checklist has been added.
        self.vue.add_pending = true;
        $.post(add_checklist_url(),
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo,
                is_public: false,
            },
            function (data) {
                $.web2py.enableElement($("#add_checklist_submit"));
                self.vue.checklists.unshift(data.checklist);
                self.vue.add_pending = false;
            });

    };

    self.edit_checklist_button = function (checklist_id) {
        // The button to edit a checklist has been pressed.
        if (checklist_id == self.vue.currently_editing) {
            // The checklist in editing has been pressed again (Canceled)
            self.vue.currently_editing = 0;
        }else{
            // A different or non-zero checklist has been selected
            self.vue.currently_editing = checklist_id;
        }
        // console.log("cl_id: " + checklist_id);
        // console.log("CE: " + self.vue.currently_editing);
    };

    self.edit_checklist = function (track_id) {
        // The submit button to edit a checklist has been added.
        self.vue.add_pending = true;
        $.post(edit_checklist_url(),
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo,
                is_public: false,
            },
            function (data) {
                $.web2py.enableElement($("#add_checklist_submit"));
                self.vue.checklists.unshift(data.checklist);
                self.vue.add_pending = false;
            });

    };
    
/*     self.edit_toggle = function (is_edit) {
        if (is_edit) {
            self.vue.is_editing = true;
            
        } else {
            // Save the value, e.g. sending it to the server.
            console.log("The user saved value " + self.vue.my_string);
            self.vue.save_pending = true;
            // Use jQuery to make the status red.
            $("div#my_div").addClass("red").show();
            $.post(edit_url,
                {my_string: self.vue.my_string},
                function (data) {
                    self.vue.save_pending = false;
                    self.vue.is_editing = false;
                    $("div#my_div").hide();
                });
        }
    }; 
 */
    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_checklist: false,
            // is_editing_checklist: false,
            currently_editing: 0,
            add_pending: false,
            checklists: [],
            logged_in: false,
            has_more: false,
            form_title: null,
            form_memo:  null,
        },
        methods: {
            edit_toggle: self.edit_toggle,
            get_more: self.get_more,
            add_checklist: self.add_checklist,
            add_checklist_button: self.add_checklist_button,
            edit_checklist: self.edit_checklist,
            edit_checklist_button: self.edit_checklist_button
        }

    });

    self.get_checklists();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});