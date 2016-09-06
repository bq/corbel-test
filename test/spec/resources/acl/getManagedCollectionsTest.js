describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('with acl collections management', function() {

            var ACL_ADMIN_COLLECTION = 'acl:Configuration';
            var COLLECTION_NAME_1 = 'test:testAcl-1' + Date.now();
            var COLLECTION_NAME_2 = 'test:testAcl-2' + Date.now();
            var managedCollectionId1, managedCollectionId2;
            var corbelRootDriver;
            var random;

            before(function(done) {
              corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
                var TEST_OBJECT = {
                    _acl: {},
                    test: 'test' + random,
                    test2: 'test2' + random
                };
                corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION)
                    .add({
                        collectionName: COLLECTION_NAME_1,
                        users: [],
                        groups: [],
                        defaultPermission: 'NONE'
                    })
                    .then(function(id) {
                        managedCollectionId1 = id;
                        return corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION)
                            .add({
                                collectionName: COLLECTION_NAME_2,
                                users: [],
                                groups: [],
                                defaultPermission: 'NONE'
                            });
                    })
                    .then(function(id) {
                        managedCollectionId2 = id;
                    })
                    .should.notify(done);
            });

            after(function(done) {
                corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, managedCollectionId1)
                    .delete()
                    .then(function() {
                        return corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, managedCollectionId2)
                            .delete();
                    }).should.notify(done);
            });

            it('admin can get all the collection managed of his domain', function(done) {
                corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION).get()
                    .then(function(response) {
                        expect(containElement(response.data, COLLECTION_NAME_1)).to.be.equal(true);
                        expect(containElement(response.data, COLLECTION_NAME_2)).to.be.equal(true);
                    }).should.notify(done);
            });

        });
    });

    function containElement(list, element) {
        return list.some(function(listElement) {
            return listElement.collectionName === element;
        });
    }
});
