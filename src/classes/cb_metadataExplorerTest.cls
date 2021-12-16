/**
 * @description       : 
 * @author            : Pelleg Maimon
 * @group             : 
 * @last modified on  : 12-15-2021
 * @last modified by  : Pelleg Maimon
**/
@isTest
private class cb_metadataExplorerTest {

    @testSetup
    private static void setupTestData() {
        
    }

    @isTest
    private static void test_getAllMetadataTypes() {
        System.assertEquals(true,  cb_metadataExplorer.getAllMetadataNames().size() > 0);
    }
    @isTest
    private static void test_getMetadataRecords() {
        cb_metadataExplorer.getMetadataRecords(cb_metadataExplorer.getAllMetadataNames()[0].name,null,'LIMIT 1','');// should be larger then 0.
    }
    @isTest
    private static void test_getMetadataFields() {
        cb_metadataExplorer.getMetadataFields(cb_metadataExplorer.getAllMetadataNames()[0].name);// should be larger then 0.
    }

    @isTest
    private static void test_getMetadataRecordData() {
        cb_metadataExplorer.getMetadataRecordData(cb_metadataExplorer.getAllMetadataNames()[0].name);// should be larger then 0.
    }

    @isTest
    private static void test_updateCustomMetadata() {
        cb_metadataExplorer.updateCustomMetadata(cb_metadataExplorer.getAllMetadataNames()[0].name,
                                                cb_metadataExplorer.getMetadataRecords(cb_metadataExplorer.getAllMetadataNames()[0].name,null,'LIMIT 1','')[0].name,
                                                cb_metadataExplorer.getMetadataRecords(cb_metadataExplorer.getAllMetadataNames()[0].name,null,'LIMIT 1','')[0].label,
                                                new List<Object>()
                                                );// should be larger then 0.
    }
    @isTest
    private static void test_createCustomMetadata() {
        cb_metadataExplorer.createCustomMetadata(cb_metadataExplorer.getAllMetadataNames()[0].name,
                                                'newMetadata',
                                                'newLabel',
                                                new List<Object>()
                                                );// should be larger then 0.
    }
}
