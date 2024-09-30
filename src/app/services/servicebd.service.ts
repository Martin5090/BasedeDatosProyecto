import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from '../model/noticias';

@Injectable({
  providedIn: 'root',
})
export class ServicebdService {
  //variable de conexión a Base de Datos
  public database!: SQLiteObject;

  //variables de creación de Tablas
  tablaNoticia: string =
    "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL);";

  //variables para los insert por defecto en nuestras tablas
  registroNoticia: string =
    "INSERT INTO noticia(idnoticia, titulo, texto) VALUES (1,'Soy un titulo', 'Soy el texto de esta noticia que se esta insertando de manera autmática')";

  //variables para guardar los datos de las consultas en las tablas
  listadoNoticias = new BehaviorSubject([]);

  //variable para el status de la Base de datos
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private alertController: AlertController
  ) {
    this.createBD();
  }

  async presentAlert(titulo: string, msj: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  //metodos para manipular los observables
  fetchNoticias(): Observable<Noticias[]> {
    return this.listadoNoticias.asObservable();
  }

  dbState() {
    return this.isDBReady.asObservable();
  }

  //función para crear la Base de Datos
  createBD() {
    //varificar si la plataforma esta disponible
    this.platform.ready().then(() => {
      //crear la Base de Datos
      this.sqlite
        .create({
          name: 'noticias.db',
          location: 'default',
        })
        .then((db: SQLiteObject) => {
          //capturar la conexion a la BD
          this.database = db;
          //llamamos a la función para crear las tablas
          this.crearTablas();
        })
        .catch((e) => {
          this.presentAlert(
            'Base de Datos',
            'Error en crear la BD: ' + JSON.stringify(e)
          );
        });
    });
  }

  async crearTablas() {
    try {
      //ejecuto la creación de Tablas
      await this.database.executeSql(this.tablaNoticia, []);

      //ejecuto los insert por defecto en el caso que existan
      await this.database.executeSql(this.registroNoticia, []);

      //modifico el estado de la Base de Datos
      this.isDBReady.next(true);

    } catch (e) {
      this.presentAlert(
        'Creación de Tablas',
        'Error en crear las tablas: ' + JSON.stringify(e)
      );
    }
  }
}
