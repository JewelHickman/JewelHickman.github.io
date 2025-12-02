-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema blog_website
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema blog_website
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `blog_website` DEFAULT CHARACTER SET utf8 ;
USE `blog_website` ;

-- -----------------------------------------------------
-- Table `blog_website`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_website`.`users` (
  `userID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `privilege` ENUM('User', 'Admin') NULL DEFAULT 'User' COMMENT 'This might do something later on',
  PRIMARY KEY (`userID`),
  UNIQUE INDEX `userID_UNIQUE` (`userID` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `blog_website`.`posts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_website`.`posts` (
  `postID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userID` BIGINT UNSIGNED NOT NULL,
  `posted` DATETIME NOT NULL DEFAULT NOW(),
  `body` TEXT NOT NULL,
  `title` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`postID`),
  UNIQUE INDEX `postID_UNIQUE` (`postID` ASC) INVISIBLE,
  INDEX `userID_idx` (`userID` ASC) VISIBLE,
  CONSTRAINT `userID`
    FOREIGN KEY (`userID`)
    REFERENCES `blog_website`.`users` (`userID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `blog_website`.`comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_website`.`comments` (
  `commentID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `postID` BIGINT UNSIGNED NOT NULL,
  `userID` BIGINT UNSIGNED NOT NULL,
  `posted` DATETIME NOT NULL DEFAULT NOW(),
  `body` TEXT NOT NULL,
  PRIMARY KEY (`commentID`),
  UNIQUE INDEX `commentID_UNIQUE` (`commentID` ASC) VISIBLE,
  INDEX `postID_idx` (`postID` ASC) VISIBLE,
  INDEX `userID_idx` (`userID` ASC) VISIBLE,
  CONSTRAINT `postID`
    FOREIGN KEY (`postID`)
    REFERENCES `blog_website`.`posts` (`postID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `userID`
    FOREIGN KEY (`userID`)
    REFERENCES `blog_website`.`users` (`userID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

USE `blog_website` ;

-- -----------------------------------------------------
-- procedure getPostsByUser
-- -----------------------------------------------------

DELIMITER $$
USE `blog_website`$$
CREATE PROCEDURE `getPostsByUser` (id INT)
BEGIN
	SELECT title, body, posted
    FROM posts
    WHERE id = posts.userID
    ORDER BY posted DESC;
END;$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure deleteAllUsers
-- -----------------------------------------------------

DELIMITER $$
USE `blog_website`$$
CREATE PROCEDURE deleteAllUsers()
BEGIN
	DECLARE id BIGINT;
	DECLARE endOfList BOOL DEFAULT FALSE;

	DECLARE curs CURSOR FOR (SELECT userID FROM users);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND
    BEGIN
		SET endOfList = TRUE;
    END;
    
    OPEN curs;
    
    WHILE (NOT endOfList) DO
		FETCH curs INTO id;
        DELETE FROM users WHERE userID = id;
    END WHILE;
    
    CLOSE curs;
END;$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure deletePost
-- -----------------------------------------------------

DELIMITER $$
USE `blog_website`$$
CREATE PROCEDURE `deletePost` (postnum BIGINT, usernum BIGINT)
BEGIN
	DECLARE authorNum BIGINT;
    DECLARE privilegeLevel ENUM('User', 'Admin');
    
    SELECT userID	-- if user trying to delete is the post's author...
		INTO authorNum
        FROM posts
        WHERE postID = postnum;
	SELECT privilege	-- or if user trying to delete has admin privileges...
		INTO privilegeLevel
        FROM users
        WHERE userID = usernum;
        
	IF authorNum = usernum OR privilegeLevel = 'Admin' THEN
		DELETE FROM posts WHERE postID = postnum;
    END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure deleteComment
-- -----------------------------------------------------

DELIMITER $$
USE `blog_website`$$
CREATE PROCEDURE `deleteComment` (commentnum BIGINT, usernum BIGINT)
BEGIN
	DECLARE authorNum BIGINT;
    DECLARE privilegeLevel ENUM('User', 'Admin');
    
    SELECT userID	-- if user trying to delete is the post's author...
		INTO authorNum
        FROM comments
        WHERE commentID = commentnum;
	SELECT privilege	-- or if user trying to delete has admin privileges...
		INTO privilegeLevel
        FROM users
        WHERE userID = usernum;
        
	IF authorNum = usernum OR privilegeLevel = 'Admin' THEN
		DELETE FROM comments WHERE commentID = commentnum;
    END IF;
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
