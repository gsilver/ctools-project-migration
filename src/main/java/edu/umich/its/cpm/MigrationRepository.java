package edu.umich.its.cpm;


import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;

public interface MigrationRepository extends CrudRepository<Migration, Integer> {

    List<Migration> findBySiteOwner(String siteOwner);
    
    List<Migration> findAll();
    
    
    /**
     * Finds finished migrations, with not-null stop time
     * @param las
     * @return  A list of persons whose last name is an exact match with the given last name.
     *          If no persons is found, this method returns an empty list.
     */
    @Query("SELECT m FROM Migration m WHERE m.stopTime IS NOT NULL")
    public List<Migration> find();
    
}