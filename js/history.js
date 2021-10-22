$(function(){

	var History = Backbone.Model.extend({
    defaults: function() {
      return {
        time: '',
        first_operand: '',
        second_operand: '',
        operator: '',
        result: '',
      };
    },
  });

	var HistoryList = Backbone.Collection.extend({
    model: History,
    localStorage: new Backbone.LocalStorage("calculator-history"),
	});

	var Histories = new HistoryList;

	var HistoryView = Backbone.View.extend({
		tagName: 'tr',
    template: _.template($('#history-template').html()),

    initialize: function () {
      this.render();
    },

    render: function () {
    	console.log(this.model);
    	this.$el
      	.html(this.template(this.model.toJSON()));
    },
	});


	var HistorisView = Backbone.View.extend({
    el: $('#wrap-calculator'),

    initialize: function () {
    	Histories.fetch();
    	this.render();
    },

    render: function () {
    	Histories.models.forEach(h => {
    		let history_view = new HistoryView({ model: h });

		  	this.$('#tbody').append(history_view.el);
		  });
	  }
	});

	var App = new HistorisView({ model: new History });
});