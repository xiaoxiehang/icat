(function(iCat){
	var mainView = iCat.View.extend(
		{
			config: {
				tempId: 'item-template',
				wrap: '#todo-list',
				isSave: true,
				events: [
					{selector:'#new-todo', type:'keypress', callback:'createOnEnter'},
					{selector:'.edit', type:'keypress', callback:'updateOnEnter'},
					{selector:'.edit', type:'blur', callback:'close'},
					{selector:'a.destroy', type:'click', callback:'clear', preventDefault:true},
					{selector:'.view', type:'dblclick!', callback:'edit'}
				]
			},

			init: function(v, m, cfg){ $('#main').show(); },

			createOnEnter: function(v, m, cfg, evt){
				if(evt.keyCode!=13) return;
				if(!this.value) return;
				v.setData(
					m.dealData(this.value, v.viewId, cfg.isSave), true
				);
				this.value = '';
			},

			updateOnEnter: function(v, m, cfg, evt){
				if(evt.keyCode!=13) return;
				iCat.Event.trigger(this, 'blur', evt);
			},

			clear: function(v, m, cfg, evt){
				$(this).parents('li').remove();
				m.remove(this.getAttribute('data-repeatid'));
			},

			edit: function(v, m, cfg){
				var me = $(this);
				me.hide();
				me.siblings('input').show().focus();
			},

			close: function(v, m, cfg){
				var me = $(this), val = this.value,
					rkey = me.attr('data-repeatid'),
					item = me.siblings('.view'), label = item.find('label');
				label.html(val);
				me.blur().hide(); item.show();
				m.dealData(val, rkey, cfg.isSave);
			}
		}
	);

	var appView = iCat.View.extend(
		{
			config: {
				tempId: 'stats-template',
				wrap: '#todo-count',
				events: [
					{selector:'#clear-completed', type:'click!', callback:'clearCompleted', preventDefault:true},
					{selector:'#toggle-all', type:'click!', callback:'toggleAllComplete'},
					{selector:'.toggle', type:'click!', callback:'toggleDone'}
				]
			},

			delSelected: [],

			clearCompleted: function(v, m){
				m.remove(v.delSelected);
				v.delSelected = [];
				iCat.View['mView'].update();

				$('#toggle-all')[0].checked = false;
				$('#todoapp footer').hide();
			},
			toggleAllComplete: function(v){
				var m = iCat.Model['__page_emptyModel'],
					me = $(this),
					lis = $('#todo-list li'),
					ft = $('#todoapp footer'),
					arr = v.delSelected;

				lis[this.checked? 'addClass' : 'removeClass']('done');
				iCat.foreach(lis, function(i, el){
					var rid = el.getAttribute('data-repeatid');
					!arr.contains(rid) && arr[$(el).hasClass('done')? 'push' : 'remove'](rid);
				});

				if(this.checked){
					ft.show();
					lis.find('.toggle').attr('checked', 'true');
					ft.find('#todo-count').hide();
					ft.find('#clear-completed').show();
					if(!v.model) v.setModel(m);
				} else {
					ft.hide();
					lis.find('.toggle').removeAttr('checked');
				}
			},

			toggleDone: function(v, m){
				var m = iCat.Model['__page_emptyModel'],
					me = $(this),
					pLi = me.parents('li'),
					ft = $('#todoapp footer'),
					arr = v.delSelected,
					maxLen = $('#todo-list li').length,
					len;

				pLi.toggleClass('done');
				var rid = pLi.attr('data-repeatid');
				!arr.contains(rid) && arr[pLi.hasClass('done')? 'push' : 'remove'](rid);
				len = arr.length;
				$('#toggle-all')[0].checked = len==maxLen;

				if(len){
					ft.show();
					ft.find('#todo-count').show();
					ft.find('#clear-completed').hide();
					if(!v.model) v.setModel(m);
					v.setData({done:len, remaining:maxLen-len}, false, true);
				} else {
					ft.hide();
				}
			}
		}
	);

	var mainModel = iCat.Model.extend({
		dealData: function(val, key, isSave){
			var data = {title:val, done:false};
			if(isSave){
				/(Repeat)_\d+/.test(key)?
					this.save(key, data, true) : this.save(key, data);
			}
			return data;
		}
	});

	var appCtrl = iCat.Controller.extend(
	{
		routes: {
			'todo': 'todoInit'
		},

		todoInit: function(){
			var c = this;
			c.init({
				view:new mainView('mView'),
				model:mainModel,
				baseBed: '#todoapp'
			});

			c.vmAdd({view:new appView('aView')});
		}
	});

	iCat.ctrlAble(new appCtrl('mCtrl'));
})(ICAT);