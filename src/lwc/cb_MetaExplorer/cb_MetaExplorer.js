import { LightningElement,track,api } from 'lwc';
import getMetadataRecords from '@salesforce/apex/cb_metadataExplorer.getMetadataRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class Cb_MetaExplorer extends LightningElement {
    @track data = [];
    recursiveBlocker = 0;
    loaded = true;
    handleRecords(event){
        var eventrows = {name:event.detail.name,records:event.detail.value,fields: event.detail.fields};
        if (this.data.filter(e => e.name === eventrows.name).length === 0) {
            this.data.push(eventrows);
        }
        this.selectTab(event.detail.name);
    }

    showToast() {
        const event = new ShowToastEvent({
            title: 'Changes takes longer then expected.',
            variant: 'alert',
            mode: 'dismissable',
            message: 'the changes are done async and sometime takes time to take effect. please wait awhile and use the refresh button to refresh the data.',
        });
        this.dispatchEvent(event);
    }

    handleEditRefresh(event){
        this.loaded = false;
        let changes = event.detail;
        this.recursiveBlocker = 0;
        this.Refresher(changes);
    }

    Refresher(changes){
        let effectedFields= [];
        changes.metadataFieldValueMap.forEach(field => {
            effectedFields.push({name:field.field, type: field.type});
        });
        getMetadataRecords({metadataApiName: changes.metadataName,extraFields: effectedFields,limiter:"",whereq:"DeveloperName  = '"+changes.recordDevName+"'"}).then((res) =>{

            let counter = 2;
            let refreshedFields= [];
            let updatedWasAchived = false;

            if(res.length == 0 || res == undefined){
                // if(this.recursiveBlocker >= 5){ // give it time to actually update the DB
                //     updatedWasAchived = true; // quick fix in case you create a new record with no extra fields basides masterlabel and developername
                // }
                
                //skip?
            }else{
                res[0].fields.forEach(field => {
                    refreshedFields.push({field:field.name, value: res[0].details[counter]});
                    counter++;
                });
                changes.metadataFieldValueMap.forEach(changedField => {
                    updatedWasAchived = false;
                    refreshedFields.forEach(updatedField => {
                        if(updatedField.field == changedField.field){
                            if(changedField.old != '' && updatedField.value == changedField.value){
                                updatedWasAchived = true;
                            }else if(changedField.old == '' && updatedField.value != ''){
                                updatedWasAchived = true;
                            }
                        }
                    });
                });
            }
            if(!updatedWasAchived && this.recursiveBlocker < 20 ){
                this.recursiveBlocker++;
               
                this.delay(1000).then(() =>  {this.Refresher(changes);});

            }else if(this.recursiveBlocker >= 20){
                this.showToast();
                console.log('wasnt able to find changes');
                this.loaded = true;
            }else{
                console.log('changes were successful');
                let tabs = this.template.querySelectorAll("c-cb_-metadata_-tab");
                tabs.forEach(tab => {
                    tab.refreshfromparent(changes.recordDevName);
                });
                this.loaded = true;
            }
        })
    }

    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }
      
    refreshRecords(event){
        let name = event.detail.name;
        let value = event.detail.value;
        getMetadataRecords({metadataApiName: name,extraFields: value,limiter:"",whereq:""}).then((res) =>{
            for(var i = 0; i < this.data.length; i++) {
                if (this.data[i].name == name) {
                    this.data[i].records = res;
                    this.data[i].fields = res[0].fields;
                    break;
                }
            }
        })
    }

    closePage(event){
        let newData = [];
        this.data.forEach(element => {
            if(element.name != event.currentTarget.dataset.name){
                newData.push(element);
            }
        });
        this.data = newData;
        this.selectTab(this.goToLastTab());
    }

    goToLastTab(){
        if(this.data.length > 0){
            return this.data[this.data.length -1].name;
        }else{
            return "main";
        }
    }

    choosePage(event){
        this.selectTab(event.currentTarget.dataset.name);
    }

    selectTab(tabName){
        let titles = this.template.querySelectorAll(".slds-sub-tabs__item");
        titles.forEach(title => {
            title.classList.remove("slds-active");
            if(title.dataset.name == tabName){
                title.classList.add("slds-active");
            }
        });
        this.showPage(tabName);
    }

    showPage(pageName){
        let pages = this.template.querySelectorAll(".slds-tabs__content");
        pages.forEach(page => {
            page.classList.remove("slds-show");
            page.classList.add("slds-hide");
            if(page.dataset.name == pageName ){
                page.classList.remove("slds-hide");
                page.classList.add("slds-show");
            }
        });
    }
    
}