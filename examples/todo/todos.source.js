(function(iCat){
	var mainView = iCat.View.extend(
		{
			config: {
				tempId: 'item-template',
				wrap: '#todo-list',
				isSave: true,
				overwrite: false,
				events: [
					{selector:'#new-todo', type:'keypress', callback:'createOnEnter'},
					{selector:'.edit', type:'keypress', callback:'updateOnEnter'},
					{selector:'.edit', type:'blur', callback:'close'},
					{selector:'a.destroy', type:'click', callback:'clear', preventDefault:true},
					{selector:'.view', type:'dblclick!', callback:'edit'}
				]
			},

			createOnEnter: function(v, m, cfg, evt){
				if(evt.keyCode!=13) return;
				if(!this.value) return;
				
				v.setData(m.addItem(this.value), true);
				this.value = '';

				var aView = iCat.View['aView'];
				aView.init(aView, aView.model);
			},

			updateOnEnter: function(v, m, cfg, evt){
				if(evt.keyCode!=13) return;
				iCat.Event.trigger(this, 'blur', evt);
			},

			clear: function(v, m, cfg, evt){
				var li = $(this).parents('li');
				m.remove(li.attr('data-repeatid'));
				li.remove();

				var aView = iCat.View['aView'];
				aView.init(aView, aView.model);
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
				m.updateItem(val, undefined, rkey);
			}
		}
	);

	var appView = iCat.View.extend(
		{
			config: {
				tempId: 'stats-template',
				wrap: '#todo-count',
				events: [
					{selector:'.clear-completed', type:'click!', callback:'clearCompleted', preventDefault:true},
					{selector:'#toggle-all', type:'click!', callback:'toggleAllComplete'},
					{selector:'.toggle', type:'click!', callback:'toggleDone'}
				]
			},

			init: function(v, m, init){
				var arr = this.arrChecked = [],
					ft = $('#todoapp footer'),
					main = $('#main'),
					countBar = ft.find('#todo-count'), allDel = countBar.siblings('.clear-completed'),
					elAll = iCat.util.queryOne('#toggle-all'),
					maxlen = m.maxLength('mView'), len;
				m.fetch({viewId:'mView', isSave:true}, function(data){
					if(!data || iCat.isEmptyObject(data)){
						main.hide(); return;
					}

					if(data.repeatData){
						data = data.repeatData;
					} else {
						main.find('li').attr('data-repeatid', data.rkey = 'mView');
						data = [data];
					}
					
					main[data.length? 'show':'hide']();
					data.forEach(function(v){
						if(v.done){
							$('li[data-repeatid='+v.rkey+']').addClass('done');
							arr.push(v.rkey);
						}
					});
				});

				len = arr.length;
				if(len){
					ft.show();
					if(maxlen==len){
						elAll.checked = true;
						countBar.hide(); allDel.show();
					} else {
						elAll.checked = false;
						countBar.show(); allDel.hide();
					}
				} else {
					elAll.checked = false;
					ft.hide();
				}

				if(init)
					return {done:len, remaining:maxlen-len};
				else {
					v.setData({done:len, remaining:maxlen-len}, false, true);
				}
			},

			clearCompleted: function(v, m){
				v.arrChecked.forEach(function(item){
					m.removeItem(item);
					$('li[data-repeatid='+item+']').remove();
				});
				v.init(v, m);
			},
			
			toggleAllComplete: function(v, m){
				var lis = this.checked?
						$('#todo-list li:not(.done)') : $('#todo-list .done'),
					isChecked = this.checked;

				iCat.foreach(lis, function(i, el){
					var me = $(el);
					isChecked?
						me.find('.toggle').attr('checked', true) : me.find('.toggle').removeAttr('checked');
					me[isChecked? 'addClass' : 'removeClass']('done');
					m.updateItem(undefined, isChecked, me.attr('data-repeatid'));
				});
				v.init(v, m);
			},

			toggleDone: function(v, m){
				var me = $(this),
					pLi = me.parents('li');

				pLi.toggleClass('done');
				m.updateItem(undefined, this.checked, pLi.attr('data-repeatid'));
				v.init(v, m);
			}
		}
	);

	var mainModel = iCat.Model.extend({
		addItem: function(val){
			return {title:val, done:false};
		},

		updateItem: function(val, done, key){
			var oldData = JSON.parse( iCat.util.storage(key) || '{}' ),
				data = {};
			if(!iCat.isUndefined(val)) data.title = val;
			if(!iCat.isUndefined(done)) data.done = done;
			this.save(key, iCat.mix(oldData, data));
		},

		removeItem: function(key){
			this.remove(key);
		},

		maxLength: function(vid){
			var keys = iCat.util.storage(vid+'Repeat') || iCat.util.storage(vid) || '';
			return keys===''? 0 :
				/\{.*\}/.test(keys)? 1 : keys.split(',').length;
		}
	});

	var appCtrl = iCat.Controller.extend(
	{
		routes: {'todo': 'todoInit'},
		todoInit: function(){
			var c = this;
			c.init({
				view:new mainView('mView'), model:mainModel,
				baseBed: '#todoapp'
			});

			c.vmAdd({view:new appView('aView'), model:mainModel});
		}
	});

	iCat.ctrlAble(new appCtrl('mCtrl'));
})(ICAT);