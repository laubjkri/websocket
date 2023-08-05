import { Component, OnInit } from '@angular/core';
import { ChatRelayMessage, User, SystemNotice } from "@websocket-common/types";
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'websocket-client';

  messages: ChatRelayMessage[] = [];
  systemNotices: SystemNotice[] = [];
  currentUser?: User;
  users: User[] = [];


  constructor(private appService: AppService, private snackbar: MatSnackBar){}

  ngOnInit() {
    this.appService.user$.subscribe(user => this.currentUser = user);
    this.appService.chatMessage$.subscribe(msg => this.messages = [...this.messages, msg]); // Here we create a new array since angular will not notice only pushing
    this.appService.systemNotice$.subscribe(notice => {
      this.systemNotices = [...this.systemNotices, notice];
      this.onSystemNotice(notice);
    });
    
    this.appService.users$.subscribe(usersList => this.users = [...usersList.users]);
  }

  connect(userNameInput: HTMLInputElement) {
    
    const name = userNameInput.value;
    this.appService.connect(name);

    console.log(`Connecting as ${name}`);
  }

  send(chatInput: HTMLInputElement) {
    this.appService.send(chatInput.value);
    chatInput.value = "";
    console.log("Current user: " + this.currentUser?.name + " Id: " + this.currentUser?.id);
  }

  onSystemNotice(notice: SystemNotice) {
    this.snackbar.open(notice.contents, undefined, { duration: 5000 });
  }


}
