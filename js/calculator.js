$(function(){

  var Calculator = Backbone.Model.extend({

    defaults: {
      result: '',
      first_operand: '',
      second_operand: '',
      operator: '',
      equal: '',
      recall_memory: false,
      number_sys: 'Dec',
      reset: false,
      operationFlag: false,
      is_on: false
    },

    operation: function (opt) {
      if (/[0-9\.]/.test(opt)) {
        this.numberOperation(opt);
      } else {
        switch (opt) {
          case '/':
          case '*':
          case '-':
          case '+':
            this.operatorOperation(opt);
            break;
          case '%': 
          case '√':
            this.rootandPercentOperation(opt);
            break;
          case '+/-':
            this.converSignOperation();
            break;
          case '=':
            this.resultOperation();
            break;
          case 'M+':
          case 'M-':
          case 'MRC':
            this.memoryManagement(opt);
            break;
          case 'Hex':
          case 'Dec':
          case 'Oct':
          case 'Bin':   
            this.programmOperation(opt);
            break;       
          case 'CE':
            this.resetOperation(opt);
            break;
        }
      }
    },

    concat: function (operand, digit) {
      if (operand === '0' && digit === '.')
        return operand + digit;
      else if (operand === '0' && digit === '0')
        return operand;
      else if (operand === '0' && digit !== '0' && digit !== '.') 
        return digit;
      else if (operand && operand.indexOf('.') != -1 && digit === '.')
        return operand;
      else
        return operand + '' + digit;
    },

    numberOperation: function (digit) {
      let result = '';

      if (this.attributes.reset) {
        if (this.attributes.operationFlag) {
          result = this.concat('0', digit);

          this.set({
            result: result,
            second_operand: result,
            reset: false
          });
        } else {
          result = this.concat('0', digit);
          
          this.set({
            result: result,
            first_operand: result,
            second_operand: '',
            operator: '',
            equal: '',
            reset: false,
            recall_memory: false
          });
        }
      } else {
        if (this.attributes.operationFlag) {
          result = this.concat(this.attributes.second_operand, digit);

          this.set({
            result: result,
            second_operand: result,
            recall_memory: false
          });
        } else {
          result = this.concat(this.attributes.first_operand, digit);

          this.set({
            result: result,
            first_operand: result,
            recall_memory: false
          });                
        }
      }
    },

    operatorOperation: function (operator) {
      if (this.attributes.operationFlag && this.attributes.second_operand != '')
        this.resultOperation();

      this.set({
        operator: operator,
        reset: true,
        operationFlag: true,
        recall_memory: false
      });
    },

    rootandPercentOperation: function (operator) {
      let result = 0;
      let first_operand = parseFloat(this.attributes.first_operand);
      let current = new Date();
      let create_time = ('0' + current.getDate()).slice(-2) + '/' + ('0' + (current.getMonth() + 1)).slice(-2)  + '/'
                        + current.getFullYear() + ' ' + ('0' + current.getHours()).slice(-2) + ':'
                        + ('0' + current.getMinutes()).slice(-2) + ':' +('0' + current.getSeconds()).slice(-2);

      if (!this.attributes.reset && this.attributes.first_operand != '') {
        if (operator == "%") 
          result = first_operand / 100;
        else
          result = Math.sqrt(first_operand);
      }

      let history_model = {
        time: create_time,
        first_operand: first_operand,
        second_operand: '',
        operator: operator,
        result: result
      };

      Histories.create(history_model);

      this.set({
        result: result,
        reset: true,
        recall_memory: false
      });
    },

    converSignOperation: function () {
      let first_operand = parseFloat(this.attributes.first_operand);
      let second_operand = parseFloat(this.attributes.second_operand);

      if (!this.attributes.operationFlag && this.attributes.first_operand != '') {
        first_operand = first_operand < 0 ? first_operand * -1 : first_operand * -1;

        this.set({
          first_operand: first_operand,
          result: first_operand,
          recall_memory: false
        });
      } else if (this.attributes.operationFlag && this.attributes.second_operand != '') {
        second_operand = second_operand < 0 ? second_operand * -1 : second_operand * -1;

        this.set({
          second_operand: second_operand,
          result: second_operand,
          recall_memory: false
        });
      }
    },

    memoryManagement: function (opt) {
      let result = parseFloat(this.attributes.result);
      let old_value = Memories.models.length == 0 ? 0 : parseFloat(Memories.models[0].attributes.value);
      let recall_memory = this.attributes.recall_memory;
      let history_model = [];
      let current = new Date();
      let create_time = ('0' + current.getDate()).slice(-2) + '/' + ('0' + (current.getMonth() + 1)).slice(-2)  + '/'
                      + current.getFullYear() + ' ' + ('0' + current.getHours()).slice(-2) + ':'
                      + ('0' + current.getMinutes()).slice(-2) + ':' +('0' + current.getSeconds()).slice(-2);

      if (this.attributes.result == '')
        result = 0;

      if (opt == "M+") {
        let new_value = old_value + result;

        history_model = {
          time: create_time,
          first_operand: old_value,
          second_operand: result,
          operator: opt,
          result: new_value
        }
        Memories.models.length == 0 ? Memories.create({value: new_value}) : Memories.models[0].save({ value: new_value });

        
      } else if (opt == "M-") {
        let new_value = old_value - result;

        history_model = {
          time: create_time,
          first_operand: old_value,
          second_operand: result,
          operator: opt,
          result: new_value
        }

        Memories.models.length == 0 ? Memories.create({value: new_value}) : Memories.models[0].save({ value: new_value });
      } else {
        if (recall_memory == false) {
          this.operation(old_value);

          this.set({
            recall_memory: true
          });
        } else {
          Memories.models.length == 0 ? Memories.create({value: 0}) : Memories.models[0].save({ value: 0 });


          this.set({
            recall_memory: false
          });
        }
      }

      Histories.create(history_model); 
    },

    programmOperation: function (opt) {
      let result = this.attributes.result;
      let first_operand = this.attributes.first_operand;
      let number_sys = this.attributes.number_sys;

      if (number_sys == 'Hex') {
        result = parseInt(result, 16);
        first_operand = parseInt(first_operand, 16);
      } else if (number_sys == 'Dec') {
        result = parseInt(result);
        first_operand = parseInt(first_operand);
      } else if (number_sys == 'Oct') {
        result = parseInt(result, 8);
        first_operand = parseInt(first_operand, 8);
      } else if (number_sys == 'Bin') {
        result = parseInt(result, 2);
        first_operand = parseInt(first_operand, 2);
      }

      $(".switch-btn").removeClass('focus-switch');

      if (opt == 'Hex') {
        result = result.toString(16);
        first_operand = first_operand.toString(16);
        number_sys = 'Hex';

        $('#hex-key').addClass('focus-switch');
      } else if (opt == 'Dec') {
        number_sys = 'Dec';

        $('#dec-key').addClass('focus-switch');
      } else if (opt == 'Oct') {
        result = result.toString(8);
        first_operand = first_operand.toString(8);
        number_sys = 'Oct';

        $('#oct-key').addClass('focus-switch');
      } else if (opt == 'Bin') {
        result = result.toString(2);
        first_operand = first_operand.toString(2);
        number_sys = 'Bin';

        $('#bin-key').addClass('focus-switch');
      }

      this.set({
          result: result,
          first_operand: first_operand,
          number_sys: number_sys
        });
    },

    switchPower: function (is_on) {
      this.set(this.defaults);
      this.set({ is_on: is_on });

      if (is_on == true) {
        $('.on-btn').addClass('focus-on');
      } else {
        $('.on-btn').removeClass('focus-on');
      }
    },

    resetOperation: function () {
      this.set(this.defaults);
      this.set({ is_on: true });
    },

    resultOperation: function () {
      let result = '';

      if (this.attributes.operator) {
        let first_operand = parseFloat(this.attributes.first_operand);
        let second_operand = parseFloat(this.attributes.second_operand);
        let operator = this.attributes.operator;

        switch (operator) {
          case '/':
            result = first_operand / second_operand;
            break;
          case '*':
            result = first_operand * second_operand;
            break;
          case '-':
            result = first_operand - second_operand;
            break;
          case '+':
            result = first_operand + second_operand;
            break;
        }
           
        this.set({
          result: result,
          first_operand: first_operand,
          second_operand: second_operand,
          equal: "=",
          reset: true,
          operationFlag: false
        });

        let current = new Date();
        let create_time = ('0' + current.getDate()).slice(-2) + '/' + ('0' + (current.getMonth() + 1)).slice(-2)  + '/'
                        + current.getFullYear() + ' ' + ('0' + current.getHours()).slice(-2) + ':'
                        + ('0' + current.getMinutes()).slice(-2) + ':' +('0' + current.getSeconds()).slice(-2);

        let history_model = {
          time: create_time,
          first_operand: first_operand,
          second_operand: second_operand,
          operator: operator,
          result: result
        };

        Histories.create(history_model);
      }
    }
  });

  var Memory = Backbone.Model.extend({
    defaults: function() {
      return {
        value: 0,
      };
    },
  });

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

  var MemoryCollection = Backbone.Collection.extend({
    model: Memory,
    localStorage: new Backbone.LocalStorage("calculator-memory"),
  });

  var Memories = new MemoryCollection;

  var HistoryList = Backbone.Collection.extend({
    model: History,
    localStorage: new Backbone.LocalStorage("calculator-history"),
  });

  var Histories = new HistoryList;

  var DisplayView = Backbone.View.extend({
    template: _.template($('#display-template').html()),

    initialize: function () {
      this.bindEvents();
      this.render();
    },

    bindEvents: function () {
      this.listenTo(this.model, 'change:result', this.render, this);
      this.listenTo(this.model, 'change:operator', this.render, this);
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });

  var AppView = Backbone.View.extend({
    el: $('#calculator'),

    initialize: function () {
      this.render();
    },

    render: function () {
      this.bindEvents();
      this.renderDisplay();

      Memories.fetch();

      return this;
    },

    bindEvents: function () {
      this.listenTo(this.model, 'change', this.onCalculatorChange, this);
    },

    renderDisplay: function () {
      this.displayView = new DisplayView({ model: this.model });
      this.$('#display-panel').append(this.displayView.el);
    },

    events: {
      'click .key': 'onKeyClick',
      'mouseover': 'hoverApp',
      'keydown': 'onKeyPress'
    },

    onKeyClick: function (e) {
      let is_on = this.model.attributes.is_on;
      let value = $(e.target).text();

      if (is_on)
        this.model.operation(value);

      if (value == 'On/Off')
        this.model.switchPower(!is_on);
    },

    hoverApp: function () {
      $("#result-display").focus();
    },

    onKeyPress: function (e) {
      let is_on = this.model.attributes.is_on;

      if (is_on) {
        switch (e.which) {
          case 96:
            this.model.operation('0');
            break;
          case 97:
            this.model.operation('1');
            break;
          case 98:
             this.model.operation('2');
            break;
          case 99:
            this.model.operation('3');
            break;
          case 100:
            this.model.operation('4');
            break;
          case 101:
            this.model.operation('5');
            break;
          case 102:
            this.model.operation('6');
            break;
          case 103:
            this.model.operation('7');
            break;
          case 104:
            this.model.operation('8');
            break;
          case 105:
            this.model.operation('9');
            break;
          case 107:
            this.model.operation('+');
            break;
          case 109:
            this.model.operation('-');
            break;
          case 106:
            this.model.operation('*');
            break;
          case 111:
            this.model.operation('/');
            break;
          case 49:
            this.model.operation('1');
            break;
          case 50:
            this.model.operation('2');
            break;
          case 51:
            this.model.operation('3');
            break;
          case 52:
            this.model.operation('4');
            break;
          case 53:
            this.model.operation('5');
            break;
          case 54:
            this.model.operation('6');
            break;
          case 55:
            this.model.operation('7');
            break;
          case 56:
            this.model.operation('8');
            break;
          case 57:
            this.model.operation('9');
            break;
          case 48:
            this.model.operation('0');
            break;
          case 13:
            this.model.operation('=');
            break;
        }

        $("#result-display").focus();
      }
    }
  });

  var App = new AppView({ model: new Calculator });
});
