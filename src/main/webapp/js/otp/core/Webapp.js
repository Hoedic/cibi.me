/* This program is free software: you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public License
   as published by the Free Software Foundation, either version 3 of
   the License, or (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/

otp.namespace("otp.core");

otp.core.Webapp = otp.Class({

    map     : null,
    
    modules : [ ],
    moduleMenu : null,
    
    activeModule : null,
    
    infoWidgets     : { },
    
    initialize : function() {

        // misc. housekeeping
        
        if(typeof console == 'undefined') console = { log: function(str) {} };
        var this_ = this;
       
        // set the logo & title
        
        if(otp.config.showLogo) {
          $('<div id="logo"><a href="'+otp.config.siteURL+'"><img src="'+otp.config.logoGraphic+'" style="height:100%"></a></div>').appendTo('#branding');

        }
        
        if(otp.config.siteName !== undefined) {
            document.title = otp.config.siteName;
            if(otp.config.showTitle) {
                $("<div id='site-title'><a href='"+otp.config.siteURL+"'>"+otp.config.siteName+"</a></div>").appendTo('#branding');
            }
        }
        
        // create the map
        
        this.map = new otp.core.Map(this);        
        
        
        // create the module selector
        
        if(otp.config.showModuleSelector) {

            $("<div id='otp_topbutton'>OTP &raquo;</div>").appendTo('#branding');
            $("<div id='otp_toptitle'>").appendTo('#branding');
        
            /*$(this.moduleMenu).mouseleave(function() {
                document.body.removeChild(this_.moduleMenu);
            });*/
            
            $('#otp_topbutton').click(function() {
                if(this_.moduleMenu == null) {
                    this_.moduleMenu = $('<div class="otp_moduleMenu">').appendTo('body');
                    
                    $.each(this_.modules, function() {
                        var module = this;
                        var labelDiv = $('<div class="otp_moduleMenuLabel">'+module.moduleName+'</div>').appendTo(this_.moduleMenu);
                        $(labelDiv).click(function() {
                            $(this_.moduleMenu).hide();
                            this_.setActiveModule(module);
                        });
                    });
                }
                
                $(this_.moduleMenu).show();
            });
        }
        
        
        // create the info widgets and links along header bar
        
        if(otp.config.infoWidgets !== undefined && otp.config.infoWidgets.length > 0) {
            var nav = $('<nav id="main-menu" role="article">').appendTo('#branding');
            var ul = $('<ul>').appendTo(nav);
            
            for(var i=0; i<otp.config.infoWidgets.length; i++) {
            
                if(otp.config.infoWidgets[i] == undefined) continue;
    
                var id = "infoWidget-"+i;            
    
                this.infoWidgets[id] = new otp.widgets.InfoWidget(otp.config.infoWidgets[i].styleId);
                this.infoWidgets[id].setContent(otp.config.infoWidgets[i].content);
                this.infoWidgets[id].hide();
                
                $("<li id='"+id+"'><a href='#'>"+otp.config.infoWidgets[i].title+"</a></li>").appendTo(ul).click(function(e) {
                    e.preventDefault();
                    this_.infoWidgets[this.id].show();
                });
            
            }
        }

        // initialize the AddThis widget
        
        addthis_config = {
		     pubid: "ra-4fb549f217255a7d",
		     data_track_clickback: false
		};
		$.getScript("http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4fb549f217255a7d");
		

        // set up some modules (TODO: generalize using config file)
        
        this.addModule(new otp.modules.annotations.AnnotationsModule(this), false);
        this.addModule(new otp.modules.bikeshare.BikeShareModule(this), true);

        
        // retrieve a saved trip, if applicable
		        
		if(window.location.hash !== "")
			otp.util.DataStorage.retrieve(window.location.hash.replace("#", ""), this.activeModule);
			
		
    },
    
    addModule : function(module, makeActive) {
        makeActive = typeof makeActive !== 'undefined' ? makeActive : false;
        this.modules.push(module);
        if(makeActive) {
            this.setActiveModule(module);
        }
    },
    
    setActiveModule : function(module) {
        //console.log("set active module: "+module.moduleName);
        if(this.activeModule != null) {
            this.activeModule.deactivate();
            
            for(var i = 0; i < this.activeModule.widgets.length; i++) {
                this.activeModule.widgets[i].hide();
            }
        }
        
        $('#otp_toptitle').html(module.moduleName);
        
        for(var i = 0; i < module.widgets.length; i++) {
            module.widgets[i].show();
        }
        
        module.activate();
        
        this.map.activeModuleChanged(this.activeModule, module);
        
        this.activeModule = module;
    },   
    
    restoreTrip : function(data) {
    	
    	this.activeModule.restorePlan(data);
   
    },
           
    hideSplash : function() {
    	$("#splash-text").hide();
    	for(widgetId in this.infoWidgets) {
        	this.infoWidgets[widgetId].hide();
    	}
    },
        
    setBounds : function(bounds)
    {
    	this.map.lmap.fitBounds(bounds);
    },
        
   
    mapClicked : function(event) {
        $(this.moduleMenu).hide();
        this.hideSplash();
        this.activeModule.handleClick(event);
    },
    
    CLASS_NAME : "otp.core.Webapp"
});

