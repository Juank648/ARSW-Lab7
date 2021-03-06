var app = (function () {
    var theObject;
    var idnumber;
    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var drawPolygon = function (polygon) {
        console.log("Entrando a draw polygon");
        console.log(polygon);
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);
        polygon.forEach(point => {
            const {x,y} = point;
            ctx.lineTo(x, y);
            ctx.stroke();
        })
        ctx.closePath();
        ctx.fill();

    }
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame){
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+idnumber, function (eventbody) {
                const object = JSON.parse(eventbody.body);
                addPointToCanvas(object);
            });
            stompClient.subscribe('/topic/newpolygon.'+idnumber, function (eventbody){
                const polygon = JSON.parse((eventbody.body));
                drawPolygon(polygon);

            });
        });

    };
    
    var alerta = function() {
                alert("Se dibujo");

    };
    var drawCircleEvent = function(){
        if (window.PointerEvent){
            canvas.addEventListener("pointerdown", event => {
                const pt = getMousePosition(event);
                addPointToCanvas(pt);

                stompClient.send("/app/newpoint."+idnumber, {}, JSON.stringify(pt));
                stompClient.send("/app/newpolygon."+idnumber, {}, JSON.stringify(pt));
            });
        }
    }

    return {

        init: function () {
            //var can = document.getElementById("canvas");
            //drawCircleEvent();
            //websocket connection
            //connectAndSubscribe();
        },
        connectId: function (id) {
            idnumber = id;
            drawCircleEvent();
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint."+idnumber, {}, JSON.stringify(pt));
            stompClient.send("/app/newpolygon."+idnumber, {}, JSON.stringify(pt));
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();