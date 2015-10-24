var eventBus = require('./eventBus');
var _ =  require('lodash-node');

module.exports = function RoomManager(){
    var self = this;
    self.rooms = {};
    return {
        getRoomsByClient : function(id){
            console.log('Getting rooms for ' + id);
            var roomarray = [];
            Object.keys(self.rooms).forEach(function(key) {
                if(self.rooms[key] instanceof room){
                    if(self.rooms[key].hasClient(id)){
                        console.log('Found room ' + self.rooms[key].id + ' for ' + id);
                        roomarray.push( self.rooms[key]);
                    }
                }
            });
            return roomarray;
        },
        getClientsByRoom : function (id) {
            console.log('Getting clients for ' + id);

            if(self.rooms[id] != undefined)
                return self.rooms[id].clients;

            console.log('No room found with Id ' + id);

        },
        removeClientFromRooms : function(client, property){
            console.log('Removing client ' + client[property] + ' from all rooms');
            var currentRooms = this.getRoomsByClient(client[property]);

            if(currentRooms.length !== 0){
                for(var i = 0; i < currentRooms.length;i++){
                    currentRooms[i].removeClient(client, 'id', function(roomName) {
                        console.log('Closing room' + roomName);
                        console.log('Removing ' + roomName + ' from active room list');
                        delete self.rooms[roomName];
                        eventBus.publishEvent('roomClosed',roomName); //ToDo : Publish whole room not just the name
                    });
                }
            }
        },
        getRoom : function(hash){
            for(var key in self.rooms){
                if(key === hash.toString())
                    return self.rooms[hash];
            }
            return undefined;
        },
        createRoom : function(roomOptions){
            console.log('Creating room ' + roomOptions.id);
            self.rooms[roomOptions.id] = new room(roomOptions);
            var eventData = _.clone(roomOptions,true);
            console.log('Announcing room ' + eventData.id + ' creation');
            eventBus.publishEvent('roomCreated',eventData);
            return self.rooms[roomOptions.id];
        }
    };
};

function room(roomOptions){
    var self = this;
    _.extend(self,roomOptions);
    self.name = self.id;
    self.clients = [];
    self.observers = 0;
    self.exactMatch = roomOptions.exactMatch || false;
    self.decrementObservers = function(empty){
        if(self.observers > 0)  {
            self.observers--;
            if(self.clients.length === 0 && self.observers === 0){
                empty(self.name);
            }
        }
    };
    self.incrementObservers = function(){
        self.observers++;
    };
    self.hasClient = function(id){
        for(var i=0;i < self.clients.length;i++){
            if(self.clients[i].id === id){
                return true;
            }
        }
    };
    self.addClient = function(client,property){
        if(self.hasClient(client[property]) != true){
            console.log('Adding client ' + client[property] + ' to room ' + self.name);
            self.clients.push(client);
        }
    };
    self.removeClient = function(client,property,empty){
        var index;
        for(var i=0;i < self.clients.length;i++){
            if(self.clients[i][property] === client[property]){
                console.log('Removing client ' + self.clients[i][property] + ' from room ' + self.name);
                index = i;
            }
        }
        self.clients.splice(index, 1);
        if(self.clients.length === 0 && self.observers === 0){
            empty(self.name);
        }
    };
}
