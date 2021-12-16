/**
 * @description       : 
 * @author            : Pelleg Maimon
 * @group             : 
 * @last modified on  : 12-15-2021
 * @last modified by  : Pelleg Maimon
**/
public with sharing class cb_metadataExplorer {


    @AuraEnabled
    public static List<metadataTitle> getAllMetadataNames(){
        List<metadataTitle> titles = new List<metadataTitle>();
        Map<String,Schema.SObjectType> schemaHandler = Schema.getGlobalDescribe();
        for(String obj: schemaHandler.keySet()){        
            if(Obj.toLowerCase().containsIgnoreCase('__mdt')){   // or endsWith 
                titles.add(getMetadataDetails(Schema.describeSObjects(new String[]{Obj})[0]));
            }
        }
        return titles;
    }


    @AuraEnabled
    public static List<metadataDetails> getMetadataRecords(String metadataApiName,List<Object> extraFields,String limiter,String whereq){
        String addedFields = '';
        List<metadataDetails> rows = new List<metadataDetails>();
        List<String> myfields = new List<String>();
        myfields.add('MasterLabel');
        myfields.add('DeveloperName');
        if(extraFields != null && !extraFields.isEmpty()){
            for (Object entry : extraFields) {
                Map<Object,Object> keyvalue = (Map<Object,Object> )entry;
                String newField = (String)keyvalue.get((object)'name');
                if(newField != 'MasterLabel' && newField != 'DeveloperName'){
                    addedFields += ','+newField;
                    myfields.add(newField);
                }
            }
        }
        String query = 'SELECT MasterLabel,DeveloperName' + addedFields + ' FROM '+metadataApiName+' '+(String.isBlank(whereq) ? '': 'WHERE '+whereq+' ')+limiter ;
        system.debug(query);
        List<sObject> sobjList =  Database.query(query);
        for (sObject obj : sobjList) {
            metadataDetails currentDetails = new metadataDetails();
            currentDetails.name = (String) obj.get('DeveloperName');
            currentDetails.label = (String) obj.get('MasterLabel');
            List<String> mydetaills = new List<String>();
            currentDetails.fields = extraFields;
            for (String field : myfields) {
                if(!String.isBlank(String.valueOf(obj.get(field)))){
                    mydetaills.add(String.valueOf(obj.get(field)));
                }else{
                    mydetaills.add('');
                }
            }
            currentDetails.details = mydetaills;
            rows.add(currentDetails);
        }
        return rows;
    }


    @AuraEnabled
    public static List<metadatafieldAttributes> getMetadataFields(String metadataApiName){
        SYSTEM.debug(metadataApiName);
        SObjectType objs = Schema.getGlobalDescribe().get(metadataApiName);
        Map<String,Schema.SObjectField> mfields = objs.getDescribe().fields.getMap();
        List<metadatafieldAttributes> items =  new List<metadatafieldAttributes>();
        for (String field : mfields.keySet()) {
            if(field != 'DeveloperName' && field != 'MasterLabel' && field != 'language' && field != 'label' && field != 'namespaceprefix' && field != 'qualifiedapiname'){
                metadatafieldAttributes att = new metadatafieldAttributes();
                att.type = String.valueOf(mfields.get(field).getDescribe().getType());
                att.name = field;
                items.add(att);
            }
        }
        return items;
    }

    @AuraEnabled
    public static List<sObject> getMetadataRecordData(String metadataApiName){
        SObjectType objs = Schema.getGlobalDescribe().get(metadataApiName);
        Map<String,Schema.SObjectField> mfields = objs.getDescribe().fields.getMap();
        String joinedString = String.join(new List<String>(mfields.keySet()), ',');
        String query = 'SELECT ' + joinedString + ' FROM '+metadataApiName;
        List<sObject> sobjList =  Database.query(query);
        return sobjList;
    }

    @AuraEnabled
    public static void createCustomMetadata(String metadataName, String label, String apiname, List<Object> metadataFieldValueMap){
        String recordDevName = apiname;
        Metadata.CustomMetadata cMetadata = new Metadata.CustomMetadata();
        cMetadata.fullName = metadataName + '.' + recordDevName;
        cMetadata.label = label;
         
        for(Object obj : metadataFieldValueMap){
            Map<Object,Object> keyvalue = (Map<Object,Object> )obj;
            Metadata.CustomMetadataValue cMetadataValue = new Metadata.CustomMetadataValue();
            string fieldname = (String)keyvalue.get((Object)'field');
            if(fieldname != 'MasterLabel' && fieldname != 'DeveloperName'){
                cMetadataValue.Field = fieldname;
                cMetadataValue.Value = keyvalue.get((Object)'value'); 
                cMetadata.values.add(cMetadataValue);
            }
        }
        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(cMetadata);
        // CustomMetadataUtils callback = new CustomMetadataUtils();
        if(!Test.isRunningTest()){
            Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, null);
        }
    }

    //Update Custom Metadata record
    @AuraEnabled
    public static void updateCustomMetadata(String metadataName, String recordDevName, String label, List<Object> metadataFieldValueMap){        
        Metadata.CustomMetadata cMetadata = new Metadata.CustomMetadata();
        cMetadata.fullName = metadataName + '.' + recordDevName;
        cMetadata.label = label;
        for(Object obj : metadataFieldValueMap){
            Map<Object,Object> keyvalue = (Map<Object,Object> )obj;
            Metadata.CustomMetadataValue cMetadataValue = new Metadata.CustomMetadataValue();
            cMetadataValue.Field = (String)keyvalue.get((Object)'field');
            cMetadataValue.Value = keyvalue.get((Object)'value'); 
            cMetadata.values.add(cMetadataValue);
        }
        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(cMetadata);

        // CustomMetadataUtils callback = new CustomMetadataUtils();
        if(!Test.isRunningTest()){
            Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, null);
        }
    }


    private static metadataTitle getMetadataDetails(Schema.DescribeSObjectResult descResult){
        metadataTitle title = new metadataTitle();
        title.label = descResult.getLabel();
        title.name = descResult.getName();
        return title;
    }

    public class metadataTitle {
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String label;
        // @AuraEnabled
        // public static String id;
    }

    public class metadataDetails {
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String label;
        @AuraEnabled
        public List<Object> fields;
        @AuraEnabled
        public List<String> details;
        // @AuraEnabled
        // public static String id;
    }

    public class metadatafieldAttributes {
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String type;
        // @AuraEnabled
        // public static String id;
    }


    public class metadatachanges {
        @AuraEnabled
        public String field;
        @AuraEnabled
        public Object value;
        @AuraEnabled
        public String type;
        // @AuraEnabled
        // public static String id;
    }
}