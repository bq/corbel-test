describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation creation ', function() {

        var corbelDriver;

        var COLLECTION_A = 'test:CorbelJSTestRelation' + Date.now();
        var COLLECTION_B = 'test:CorbelJSTestRelation-dest' + Date.now();

        var resourceIdA;
        var resourceIdB1, resourceIdB2, resourceIdB3;

        var TEST_OBJECT = {
            name : 'testObject',
            date : Date.now()
        };

        var EXTRA_DATA = {
            myextrafield : 'test',
            secondField : 'second'
        };

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelDriver.resources.collection(COLLECTION_A)
            .add(TEST_OBJECT)
            .then(function(id) {
                resourceIdA = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT);
            })
            .then(function(id) {
                resourceIdB1 = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT);
            })
            .then(function(id) {
                resourceIdB2 = id;

                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT);
            })
            .then(function(id) {
                resourceIdB3 = id;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.collection(COLLECTION_A, resourceIdA)
            .delete()
            .then(function() {
                return corbelDriver.resources.collection(COLLECTION_B, resourceIdB1)
                .delete();
            })
            .then(function() {
                return corbelDriver.resources.collection(COLLECTION_B, resourceIdB2)
                .delete();
            })
            .then(function() {
                return corbelDriver.resources.collection(COLLECTION_B, resourceIdB3)
                .delete();
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
            .delete()
            .notify(done);
        });

        describe('when relating certain resources from a collection to a resource from another collection', function() {

            it('a relation with no extra fields can be created', function(done) {
                var idRelationArray = [];

                corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB1)
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB1);
                })
                .then(function(response){
                    idRelationArray.push(response.data.id);

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .add(resourceIdB2);
                })
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB2);
                })
                .then(function(response){
                    idRelationArray.push(response.data.id);

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 2);

                    response.data.forEach(function(element, i) {
                        expect(element).to.have.property('id',idRelationArray[i]);
                    });
                })
                .should.notify(done);
            });

            it('a relation with extra fields can be created & collection resources are not changed', function(done) {
                var idRelationArray = [];

                corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB1, EXTRA_DATA)
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB1);
                })
                .then(function(response){
                    idRelationArray.push(response.data.id);

                    expect(response).to.have.deep.property('data.myextrafield', 'test');
                    expect(response).to.have.deep.property('data.secondField', 'second');

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .add(resourceIdB2);
                })
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB2);
                })
                .then(function(response){
                    idRelationArray.push(response.data.id);

                    expect(response).to.not.have.deep.property('data.myextrafield');
                    expect(response).to.not.have.deep.property('data.secondField');

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 2);

                    response.data.forEach(function(element, i) {
                        expect(element).to.have.property('id',idRelationArray[i]);
                    });
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 3);

                    response.data.forEach(function(element) {
                        expect(element).to.not.contain.key('myextrafield');
                        expect(element).to.not.contain.key('secondField');
                    });
                })
                .should.notify(done);
            });

            it('a relation with no extra fields can be created and updated with extra data', function(done) {
                var relationResourceB1Id;

                corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB1)
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB1);
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .add(resourceIdB1, EXTRA_DATA);
                })
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 1);

                    expect(response).to.have.deep.property('data[0].myextrafield', 'test');
                    expect(response).to.have.deep.property('data[0].secondField', 'second');

                    return corbelDriver.resources.collection(COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    response.data.forEach(function(element) {
                        expect(element).to.not.contain.key('myextrafield');
                        expect(element).to.not.contain.key('secondField');
                    });
                })
                .should.notify(done);
            });

            it('a relation with extra fields can be created and updated with other extra data', function(done) {
                corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                .add(resourceIdB1, EXTRA_DATA)
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB1);
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.myextrafield', 'test');
                    expect(response).to.have.deep.property('data.secondField', 'second');

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .add(resourceIdB1, {
                        myextrafield : 'updatedField',
                        thirdField : 'third'
                    });
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB1)
;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.myextrafield', 'updatedField');
                    expect(response).to.have.deep.property('data.secondField', 'second');
                    expect(response).to.have.deep.property('data.thirdField', 'third');

                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .add(resourceIdB1, {
                        myextrafield : null
                    });
                })
                .then(function(response){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get(resourceIdB1);
                })
                .then(function(response){
                    expect(response).not.to.have.deep.property('data.myextrafield');
                    expect(response).to.have.deep.property('data.secondField', 'second');
                    expect(response).to.have.deep.property('data.thirdField', 'third');
                })
                .should.notify(done);
            });
        });

        describe('when relating all resources from a collection to a resource from another collection', function() {

            var promises, promise;
            var allResourcesFromCollectionB;

            it('a relation with no extra fields can be created', function(done) {
                corbelDriver.resources.collection(COLLECTION_B)
                .get()
                .then(function(response){
                    allResourcesFromCollectionB = response.data;

                    promises = response.data.map(function(element) {
                        return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                        .add(element.id);
                    });

                    return Promise.all(promises);
                })
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    expect(response).to.have.property('data');
                    expect(response.data.size).to.be.equal(allResourcesFromCollectionB.size);
                })
                .should.notify(done);
            });

            it('a relation with extra fields can be created & collection resources are not changed', function(done) {
                corbelDriver.resources.collection(COLLECTION_B)
                .get()
                .then(function(response){
                    allResourcesFromCollectionB = response.data;

                    promises = response.data.map(function(element) {
                        return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                        .add(element.id, EXTRA_DATA);
                    });

                    return Promise.all(promises);
                })
                .then(function(){
                    return corbelDriver.resources.relation(COLLECTION_A, resourceIdA, COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    expect(response).to.have.property('data');
                    expect(response.data.size).to.be.equal(allResourcesFromCollectionB.size);

                    response.data.forEach(function(element) {
                        expect(element).to.have.deep.property('myextrafield', 'test');
                        expect(element).to.have.deep.property('secondField', 'second');
                    });

                    return corbelDriver.resources.collection(COLLECTION_B)
                    .get();
                })
                .then(function(response){
                    response.data.forEach(function(element) {
                        expect(element).to.not.contain.key('myextrafield');
                        expect(element).to.not.contain.key('secondField');
                    });
                })
                .should.notify(done);
            });
        });
    });
});
