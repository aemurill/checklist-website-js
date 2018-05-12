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
    
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
    
    function get_checklist_url(start_idx, end_idx) {
        // console.log('get_checklist_url');
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return checklist_url + "?" + $.param(pp);
    }
    
    function reset_form() {
        self.vue.form_title = null;
        self.vue.form_memo =  null;
    }
    
    self.get_checklists = function () {
        // console.log("get_checklist");
        $.getJSON(get_checklist_url(0, 10), function (data) {
            self.vue.checklists = data.checklists;
            self.vue.has_more = data.has_more;
            self.vue.auth_email = data.auth_email;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.checklists);
        })
    };
    
    self.get_more = function () {
        var num_checklists = self.vue.checklists.length;
        // console.log(num_checklists);
        $.getJSON(get_checklist_url(num_checklists, num_checklists + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.checklists, data.checklists);
            enumerate(self.vue.checklists);
        });
    };
    

    
    self.add_checklist_button = function () {
        // The button to add a checklist has been pressed.
        self.vue.is_adding_checklist = !self.vue.is_adding_checklist;
        if (self.vue.is_adding_checklist == false) {reset_form()}
    };

    self.add_checklist = function () {
        // The submit button to add a checklist has been added.
        self.vue.add_pending = true;
        $.post(add_checklist_url,
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo,
                is_public: false,
            },
            function (data) {
                $.web2py.enableElement($("#add_checklist_submit"));
                self.vue.add_pending = false;
                self.get_checklists();
                self.vue.is_adding_checklist = false;
                reset_form()
            });
    };

    self.toggle_is_public = function (checklist_idx) {
        console.log(checklist_idx);
        console.log(self.vue.checklists.length);
        var checklist = self.vue.checklists[checklist_idx];
        console.log(checklist);
        checklist.visibility = !checklist.visibility;
        $.post(toggle_visibilty_url,
            {cl_id: checklist.id},
            function () {
                self.get_checklists();
            }
        )
    };

    self.edit_checklist_button = function (checklist_idx) {
        // The button to edit a checklist has been pressed.
        if (checklist_idx == self.vue.selected_checklist_idx) {
            // The checklist in editing has been pressed again (Canceled)
            self.vue.selected_checklist_idx = -1;
        }else{
            // A different or non-zero checklist has been selected
            self.vue.selected_checklist_idx = checklist_idx;
        }
        reset_form()
    };

    self.edit_checklist = function () {
        // The submit button to edit a checklist has been added.
        console.log(self.vue.selected_checklist_idx);
        self.vue.edit_pending = true;
        var checklist = self.vue.checklists[self.vue.selected_checklist_idx];
        console.log(checklist);
        $.post(edit_checklist_url,
            {
                cl_id: checklist.id,
                title: self.vue.form_title,
                memo: self.vue.form_memo,
            },
            function (data) {
                $.web2py.enableElement($("#edit_checklist_submit"));
                self.vue.edit_pending = false;
                self.get_checklists();
                self.vue.selected_checklist_idx = -1;
            });

    };
    
    self.delete_checklist = function (checklist_idx) {
        var checklist = self.vue.checklists[checklist_idx];
        $.post(del_checklist_url,
            {cl_id: checklist.id},
            function () {
                self.get_checklists();
            }
        )
    };
    
    

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_checklist: false,
            visibility: false,
            selected_checklist_idx: -1,
            add_pending: false,
            edit_pending: false,
            checklists: [],
            logged_in: false,
            auth_email: null,
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
            edit_checklist_button: self.edit_checklist_button,
            toggle_is_public: self.toggle_is_public,
            delete_checklist: self.delete_checklist,
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