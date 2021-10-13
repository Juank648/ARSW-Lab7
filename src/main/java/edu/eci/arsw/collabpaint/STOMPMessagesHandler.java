package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class STOMPMessagesHandler {
    public List<Point> listaPuntos = new ArrayList<>();

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        System.out.println("Enviado a:"+"/topic/newpoint"+numdibujo);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
    }

    @MessageMapping("/newpolygon.{numdibujo}")
    public void handlePolygonEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {

        listaPuntos.add(pt);
        System.out.println("Cantidad de puntos registrados: "+listaPuntos.size());
        if(listaPuntos.size() > 2){
            System.out.println("Lista Completa: ");
            System.out.println(listaPuntos);
            System.out.println("Enviado a: "+"/topic/newpolygon."+numdibujo);
            msgt.convertAndSend("/topic/newpolygon."+numdibujo, listaPuntos);
            listaPuntos.clear();
        }

    }


}