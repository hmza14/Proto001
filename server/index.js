import express from "express"
import pkg from "pg"; // This is how you import a package in ES6 modules
import cors from "cors"

const { Pool } = pkg;

const app = express()

app.use(express.json())
app.use(cors())

const pool = new Pool({
  user: 'postgres',      // Your PostgreSQL username
  host: 'localhost',     // Database host, typically localhost
  database: 'proto_DB',     // Your database name
  password: 'root',      // Your PostgreSQL password
  port: 5432,            // Default PostgreSQL port
});



app.get("/", (req,res)=>{
  res.json("Hello this is the backend !")
})


app.get("/ot", async (req, res) => {
  const q = "SELECT * FROM OTH_DAT WHERE oth_stat != '099' AND oth_stat != '030'";
  try {
      const result = await pool.query(q);
      res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
  }
});


app.post("/ot", async (req, res) => {
  const { 
    exp_lib, 
    exp_code, 
    oth_lib, 
    oth_typc, 
    act_code, 
    oth_stat,
    oth_sidd,
    oth_sihd,
    oth_sitd,
    oth_cotr,
    oth_cha1,
    oth_cha2,
    oth_cha3
  } = req.body;
  
  if (!exp_lib || !exp_code || !oth_lib || !oth_typc) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: exp_lib, exp_code, oth_lib, oth_typc" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the max oth_keyu to increment
    const maxKeyuQuery = "SELECT COALESCE(MAX(oth_keyu), 1000) as max_keyu FROM OTH_DAT";
    const keyuResult = await client.query(maxKeyuQuery);
    const nextKeyu = parseInt(keyuResult.rows[0].max_keyu) + 1;
    
    // Get the max oth_icod to increment
    const maxIcodQuery = "SELECT MAX(oth_icod) as max_icod FROM OTH_DAT";
    const icodResult = await client.query(maxIcodQuery);
    let nextIcod = 'OT001';
    
    if (icodResult.rows[0].max_icod) {
      // Extract the number part and increment
      const icodMatch = icodResult.rows[0].max_icod.match(/OT(\d+)/);
      if (icodMatch && icodMatch[1]) {
        const icodNum = parseInt(icodMatch[1], 10) + 1;
        nextIcod = `OT${icodNum.toString().padStart(3, '0')}`;
      }
    }
    
    // Get the current date and time for creation timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Format time as HHMMSS (6 characters) without colons
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds; // Format as HHMMSS
    
    // Insert the new OT with the additional fields
    const insertQuery = `
      INSERT INTO OTH_DAT (
        oth_keyu, oth_icod, oth_lib, exp_lib, exp_code, 
        act_code, oth_stat, oth_typc, 
        oth_crda, oth_crhe, oth_crqi,
        oth_sidd, oth_sihd, oth_sitd, oth_cotr, 
        oth_cha1, oth_cha2, oth_cha3
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    
    const insertValues = [
      nextKeyu,
      nextIcod,
      oth_lib,
      exp_lib,
      exp_code,
      act_code || 'ACT001',
      oth_stat || '010',
      oth_typc,
      formattedDate,
      formattedTime,
      'FRONTEND',
      oth_sidd || null,
      oth_sihd || null,
      oth_sitd || null,
      oth_cotr || null,
      oth_cha1 || null,
      oth_cha2 || null,
      oth_cha3 || null
    ];
    
    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');
    
    res.status(201).json({
      status: "success",
      message: "OT created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating OT:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

app.get("/cmd", async (req, res) => {
  // Updated query to exclude "archived" records (otl_stat = '099')
  const q = "SELECT * FROM OTL_DAT WHERE otl_stat != '099'";
  try {
      const result = await pool.query(q);
      res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
  }
});

// POST /cmd to create a new command
app.post("/cmd", async (req, res) => {
  // Extract all the new fields from request body
  const { 
    exp_code,
    exp_lib,
    otl_poch,
    otl_rfcl,
    loc_pdcd,
    otl_pdnm,      // This is the "Nom stop" (was originally otl_lib)
    otl_darp,
    otl_adr1,
    otl_advl,
    otl_addp,
    otl_cgrp,
    otl_caxe,
    otl_cont,
    otl_ntel,
    loc_imel,
    loc_hope,
    loc_hclo,
    otl_thay,
    otl_tgr,
    otl_ttco,
    otl_ttpl,
    otl_tbl,
    otl_tbil,
    otl_tchq,
    otl_tttc,
    act_devi
  } = req.body;
  
  // Validate mandatory fields
  if (!exp_lib || !exp_code || !otl_poch || !otl_pdnm || !otl_adr1) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: exp_lib, exp_code, otl_poch, otl_pdnm, otl_adr1" 
    });
  }

  // Validate field lengths
  if (otl_poch && otl_poch.length > 25) {
    return res.status(400).json({ 
      status: "error", 
      message: "otl_poch cannot exceed 25 characters" 
    });
  }

  if (otl_pdnm && otl_pdnm.length > 50) {
    return res.status(400).json({ 
      status: "error", 
      message: "otl_pdnm cannot exceed 50 characters" 
    });
  }

  if (otl_adr1 && otl_adr1.length > 250) {
    return res.status(400).json({ 
      status: "error", 
      message: "otl_adr1 cannot exceed 250 characters" 
    });
  }

  // Validate date is not in the past
  if (otl_darp) {
    const deliveryDate = new Date(otl_darp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);
    
    if (deliveryDate < today) {
      return res.status(400).json({ 
        status: "error", 
        message: "Delivery date cannot be in the past" 
      });
    }
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the max otl_keyu to increment
    const maxKeyuQuery = "SELECT COALESCE(MAX(otl_keyu), 2000) as max_keyu FROM OTL_DAT";
    const keyuResult = await client.query(maxKeyuQuery);
    const nextKeyu = parseInt(keyuResult.rows[0].max_keyu) + 1;
    
    // Get the max otl_code to increment
    const maxCodeQuery = "SELECT MAX(otl_code) as max_code FROM OTL_DAT";
    const codeResult = await client.query(maxCodeQuery);
    let nextCode = 'CMD001';
    
    if (codeResult.rows[0].max_code) {
      // Extract the number part and increment
      const codeMatch = codeResult.rows[0].max_code.match(/CMD(\d+)/);
      if (codeMatch && codeMatch[1]) {
        const codeNum = parseInt(codeMatch[1], 10) + 1;
        nextCode = `CMD${codeNum.toString().padStart(3, '0')}`;
      }
    }
    
    // Get the current date and time for creation timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Format time as HHMMSS (6 characters) without colons
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds; // Format as HHMMSS
    
    // Insert the new command with all fields
    const insertQuery = `
      INSERT INTO OTL_DAT (
        otl_keyu, otl_code, act_code, otl_stat,
        otl_crda, otl_crhe, otl_crqi,
        exp_code, exp_lib, otl_poch, otl_rfcl, loc_pdcd, 
        otl_pdnm, otl_darp, otl_adr1, otl_advl, otl_addp,
        otl_cgrp, otl_caxe, otl_cont, otl_ntel, loc_imel,
        loc_hope, loc_hclo, otl_thay, otl_tgr, otl_ttco,
        otl_ttpl, otl_tbl, otl_tbil, otl_tchq, otl_tttc, act_devi
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
      )
      RETURNING *
    `;
    
    const insertValues = [
      nextKeyu,                           // $1
      nextCode,                           // $2
      'ACT001',                          // $3
      'NEW',                             // $4
      formattedDate,                     // $5
      formattedTime,                     // $6
      'FRONTEND',                        // $7
      exp_code || null,                  // $8
      exp_lib || null,                   // $9
      otl_poch || null,                  // $10
      otl_rfcl || null,                  // $11
      loc_pdcd || null,                  // $12
      otl_pdnm || null,                  // $13
      otl_darp || null,                  // $14
      otl_adr1 || null,                  // $15
      otl_advl || null,                  // $16
      otl_addp || null,                  // $17
      otl_cgrp || null,                  // $18
      otl_caxe || null,                  // $19
      otl_cont || null,                  // $20
      otl_ntel || null,                  // $21
      loc_imel || null,                  // $22
      loc_hope || null,                  // $23
      loc_hclo || null,                  // $24
      otl_thay || false,                 // $25
      otl_tgr || false,                  // $26
      otl_ttco || false,                 // $27
      otl_ttpl || false,                 // $28
      otl_tbl || false,                  // $29
      otl_tbil || false,                 // $30
      otl_tchq || false,                 // $31
      otl_tttc || null,                  // $32
      act_devi || null                   // $33
    ];
    
    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');
    
    res.status(201).json({
      status: "success",
      message: "Command created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating command:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE OT (Archive by setting status to '099')
app.delete("/ot/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if this OT has any assigned commands
    const checkAssignedQuery = `
      SELECT COUNT(*) as cmd_count 
      FROM OTL_DAT 
      WHERE oth_keyu = $1 AND otl_stat != '099'
    `;
    const checkResult = await client.query(checkAssignedQuery, [id]);
    
    if (parseInt(checkResult.rows[0].cmd_count) > 0) {
      // Has assigned commands, can't delete
      return res.status(400).json({
        status: "error",
        message: "Cannot delete OT with assigned commands. Please unassign all commands first."
      });
    }
    
    // Update OT status to '099' (archived)
    const updateQuery = `
      UPDATE OTH_DAT 
      SET oth_stat = '099' 
      WHERE oth_keyu = $1
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [id]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "OT not found"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "OT archived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving OT:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE Multiple OTs (Archive by setting status to '099')
app.delete("/ot", async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or invalid required parameter: ids" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if any of these OTs have assigned commands
    const checkAssignedQuery = `
      SELECT oth_keyu, COUNT(*) as cmd_count 
      FROM OTL_DAT 
      WHERE oth_keyu = ANY($1) AND otl_stat != '099'
      GROUP BY oth_keyu
    `;
    const checkResult = await client.query(checkAssignedQuery, [ids]);
    
    const assignedOTs = checkResult.rows.filter(row => parseInt(row.cmd_count) > 0);
    
    if (assignedOTs.length > 0) {
      // Some OTs have assigned commands
      const assignedIds = assignedOTs.map(row => row.oth_keyu);
      return res.status(400).json({
        status: "error",
        message: `Cannot delete OTs with assigned commands. OTs with IDs ${assignedIds.join(', ')} have commands assigned. Please unassign all commands first.`
      });
    }
    
    // Update OT status to '099' (archived)
    const updateQuery = `
      UPDATE OTH_DAT 
      SET oth_stat = '099' 
      WHERE oth_keyu = ANY($1)
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [ids]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No OTs found with provided IDs"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${result.rowCount} OTs archived successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving OTs:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// Get specific OT by ID
app.get("/ot/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  try {
    const query = "SELECT * FROM OTH_DAT WHERE oth_keyu = $1 AND oth_stat != '099' AND oth_stat != '030'";
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "OT not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching OT details:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// Update an existing OT
app.put("/ot/:id", async (req, res) => {
  const id = req.params.id;
  const { 
    exp_lib, 
    exp_code, 
    oth_lib, 
    oth_typc,
    oth_sidd,
    oth_sihd,
    oth_sitd,
    oth_cotr,
    oth_cha1,
    oth_cha2,
    oth_cha3
  } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  if (!exp_lib || !exp_code || !oth_lib || !oth_typc) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: exp_lib, exp_code, oth_lib, oth_typc" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the current date and time for update timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Format time as HHMMSS (6 characters) without colons
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds; // Format as HHMMSS
    
    // Update the OT record
    const updateQuery = `
      UPDATE OTH_DAT 
      SET 
        exp_lib = $1, 
        exp_code = $2, 
        oth_lib = $3, 
        oth_typc = $4,
        OTH_MODA = $5,
        OTH_MOHE = $6,
        OTH_MOQI = $7,
        oth_sidd = $8,
        oth_sihd = $9,
        oth_sitd = $10,
        oth_cotr = $11,
        oth_cha1 = $12,
        oth_cha2 = $13,
        oth_cha3 = $14
      WHERE oth_keyu = $15
      RETURNING *
    `;
    
    const updateValues = [
      exp_lib,
      exp_code,
      oth_lib,
      oth_typc,
      formattedDate,
      formattedTime,
      'FRONTEND',
      oth_sidd || null,
      oth_sihd || null,
      oth_sitd || null,
      oth_cotr || null,
      oth_cha1 || null,
      oth_cha2 || null,
      oth_cha3 || null,
      id
    ];
    
    const result = await client.query(updateQuery, updateValues);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "OT not found or cannot be updated"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "OT updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating OT:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


// DELETE CMD (Archive by setting status to '099')
app.delete("/cmd/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update CMD status to '099' (archived)
    const updateQuery = `
      UPDATE OTL_DAT 
      SET otl_stat = '099' 
      WHERE otl_keyu = $1
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [id]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "Command not found"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "Command archived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving command:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE Multiple CMDs (Archive by setting status to '099')
app.delete("/cmd", async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or invalid required parameter: ids" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update CMD status to '099' (archived)
    const updateQuery = `
      UPDATE OTL_DAT 
      SET otl_stat = '099' 
      WHERE otl_keyu = ANY($1)
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [ids]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No commands found with provided IDs"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${result.rowCount} commands archived successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving commands:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// New endpoint to assign CMD to OT
app.put("/assign-cmd-to-ot", async (req, res) => {
  const { otId, cmdIds } = req.body;
  
  if (!otId || !cmdIds || !Array.isArray(cmdIds) || cmdIds.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid request. Required: otId and cmdIds array." 
    });
  }

  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // 1. Update all CMD records to set oth_keyu to otId AND update otl_stat to "020"
    const updateCmdsQuery = `
      UPDATE OTL_DAT 
      SET oth_keyu = $1, otl_stat = '020'  
      WHERE OTL_KEYU = ANY($2)
    `;
    await client.query(updateCmdsQuery, [otId, cmdIds]);
    
    // 2. Update OT status to "020"
    const updateOtQuery = `
      UPDATE OTH_DAT 
      SET OTH_STAT = '020' 
      WHERE OTH_KEYU = $1
    `;
    await client.query(updateOtQuery, [otId]);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    res.status(200).json({ 
      status: "success", 
      message: "Commands assigned to OT successfully" 
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// New endpoint to unassign CMD from OT
app.put("/unassign-cmd-from-ot", async (req, res) => {
  const { otId, cmdId } = req.body;
  
  if (!otId || !cmdId) {
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid request. Required: otId and cmdId." 
    });
  }

  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // 1. Update CMD record to remove oth_keyu and set status back to NEW
    const updateCmdQuery = `
      UPDATE OTL_DAT 
      SET oth_keyu = NULL, otl_stat = 'NEW'
      WHERE OTL_KEYU = $1 AND oth_keyu = $2
    `;
    await client.query(updateCmdQuery, [cmdId, otId]);
    
    // 2. Check if this OT still has any CMDs assigned
    const checkOtQuery = `
      SELECT COUNT(*) as cmd_count 
      FROM OTL_DAT 
      WHERE oth_keyu = $1
    `;
    const result = await client.query(checkOtQuery, [otId]);
    
    // 3. If no CMDs are assigned to this OT, update OT status to "010"
    if (result.rows[0].cmd_count === 0) {
      const updateOtQuery = `
        UPDATE OTH_DAT 
        SET OTH_STAT = '010' 
        WHERE OTH_KEYU = $1
      `;
      await client.query(updateOtQuery, [otId]);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    res.status(200).json({ 
      status: "success", 
      message: "Command unassigned from OT successfully" 
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


app.get("/assignments", async (req, res) => {
  try {
    // Use a simpler, more direct query that doesn't rely on joins
    // Updated to exclude archived CMDs (otl_stat = '099')
    const query = `
      SELECT otl_keyu, otl_code, otl_pdnm, otl_stat, oth_keyu 
      FROM OTL_DAT 
      WHERE oth_keyu IS NOT NULL AND otl_stat != '099'
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} assignments:`, result.rows);
    
    // Group by OT ID and ensure proper parsing of numeric values
    const assignments = {};
    
    result.rows.forEach(row => {
      // Ensure oth_keyu is treated as a number
      const otId = Number(row.oth_keyu);
      
      if (!assignments[otId]) {
        assignments[otId] = [];
      }
      
      assignments[otId].push({
        otl_keyu: row.otl_keyu,
        otl_code: row.otl_code,
        otl_pdnm: row.otl_pdnm,
        otl_stat: row.otl_stat,
        id: row.otl_keyu
      });
    });
    
    console.log("Grouped assignments:", assignments);
    
    res.status(200).json({ 
      status: "success", 
      data: assignments 
    });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
});

app.get("/equipment", async (req, res) => {
  const q = "SELECT * FROM EQP_DAT WHERE eqp_stat = '020'";
  try {
    const result = await pool.query(q);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.put("/validate-ot", async (req, res) => {
  const { otIds, equipmentId } = req.body;
  
  if (!otIds || !Array.isArray(otIds) || otIds.length === 0 || !equipmentId) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: otIds or equipmentId" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, check if all selected OTs have assigned commands
    const checkAssignmentsQuery = `
      SELECT oth_keyu, COUNT(otl_keyu) as cmd_count
      FROM OTL_DAT
      WHERE oth_keyu = ANY($1) AND otl_stat != '099'
      GROUP BY oth_keyu
    `;
    
    const assignmentResult = await client.query(checkAssignmentsQuery, [otIds]);
    
    // Extract OT IDs that have assignments
    const otIdsWithAssignments = assignmentResult.rows.map(row => row.oth_keyu);
    
    // Check if any selected OT has no assignments
    if (otIdsWithAssignments.length < otIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: "error",
        message: "Certains OTs sélectionnés n'ont pas de commandes assignées. Validation impossible."
      });
    }
    
    // Update OT status to '030' (validated)
    const updateOTQuery = `
      UPDATE OTH_DAT 
      SET oth_stat = '030' 
      WHERE oth_keyu = ANY($1)
      RETURNING *
    `;
    
    const updateOTResult = await client.query(updateOTQuery, [otIds]);
    
    if (updateOTResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No OTs found with provided IDs"
      });
    }
    
    // Update equipment status to '030'
    const updateEquipmentQuery = `
      UPDATE EQP_DAT 
      SET eqp_stat = '030' 
      WHERE eqp_keyu = $1
      RETURNING *
    `;
    
    const updateEquipmentResult = await client.query(updateEquipmentQuery, [equipmentId]);
    
    if (updateEquipmentResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "Equipment not found"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${updateOTResult.rowCount} OTs validated successfully`,
      data: {
        updatedOTs: updateOTResult.rows,
        updatedEquipment: updateEquipmentResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error validating OTs:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


// Endpoint to get all KPIs in a single request
app.get("/kpis", async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Get count of validated OTs
    const validatedOTsQuery = "SELECT COUNT(*) as count_oth FROM OTH_DAT WHERE oth_stat = '030'";
    const validatedOTsResult = await client.query(validatedOTsQuery);
    
    // Get count of processed commands
    const processedCmdsQuery = "SELECT COUNT(*) as count_otl FROM OTL_DAT WHERE otl_stat IN ('020', '030')";
    const processedCmdsResult = await client.query(processedCmdsQuery);
    
    // Get count of available equipment
    const availableEquipmentQuery = "SELECT COUNT(*) as count_eqp FROM EQP_DAT WHERE eqp_stat = '020'";
    const availableEquipmentResult = await client.query(availableEquipmentQuery);
    
    // Get count of exploited equipment - NEW
    const exploitedEquipmentQuery = "SELECT COUNT(*) as count_eqp FROM EQP_DAT WHERE eqp_stat = '030'";
    const exploitedEquipmentResult = await client.query(exploitedEquipmentQuery);
    
    // Prepare response with all KPIs
    const kpis = {
      validatedOTs: parseInt(validatedOTsResult.rows[0].count_oth) || 0,
      processedCommands: parseInt(processedCmdsResult.rows[0].count_otl) || 0,
      availableEquipment: parseInt(availableEquipmentResult.rows[0].count_eqp) || 0,
      exploitedEquipment: parseInt(exploitedEquipmentResult.rows[0].count_eqp) || 0 // NEW
    };
    
    res.status(200).json({
      status: "success",
      data: kpis
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  } finally {
    client.release();
  }
});


app.get("/cmd/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  try {
    const query = "SELECT * FROM OTL_DAT WHERE otl_keyu = $1 AND otl_stat != '099'";
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "CMD not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching CMD details:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});


// Update an existing CMD
app.put("/cmd/:id", async (req, res) => {
  const id = req.params.id;
  const { 
    exp_code,
    exp_lib,
    otl_poch,
    otl_rfcl,
    loc_pdcd,
    otl_pdnm,
    otl_darp,
    otl_adr1,
    otl_advl,
    otl_addp,
    otl_cgrp,
    otl_caxe,
    otl_cont,
    otl_ntel,
    loc_imel,
    loc_hope,
    loc_hclo,
    otl_thay,
    otl_tgr,
    otl_ttco,
    otl_ttpl,
    otl_tbl,
    otl_tbil,
    otl_tchq,
    otl_tttc,
    act_devi
  } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  if (!exp_lib || !exp_code || !otl_poch || !otl_pdnm || !otl_adr1) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: exp_lib, exp_code, otl_poch, otl_pdnm, otl_adr1" 
    });
  }

  // Validate field lengths
  if (otl_poch && otl_poch.length > 25) {
    return res.status(400).json({ 
      status: "error", 
      message: "otl_poch cannot exceed 25 characters" 
    });
  }

  if (otl_pdnm && otl_pdnm.length > 50) {
    return res.status(400).json({ 
      status: "error", 
      message: "otl_pdnm cannot exceed 50 characters" 
    });
  }

  if (otl_adr1 && otl_adr1.length > 250) {
    return res.status(400).json({ 
      status: "error", 
      message: "otl_adr1 cannot exceed 250 characters" 
    });
  }

  // Validate date is not in the past
  if (otl_darp) {
    const deliveryDate = new Date(otl_darp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);
    
    if (deliveryDate < today) {
      return res.status(400).json({ 
        status: "error", 
        message: "Delivery date cannot be in the past" 
      });
    }
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the current date and time for update timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Format time as HHMMSS (6 characters) without colons
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds; // Format as HHMMSS
    
    // Update the CMD record
    const updateQuery = `
      UPDATE OTL_DAT 
      SET 
        exp_code = $1,
        exp_lib = $2,
        otl_poch = $3,
        otl_rfcl = $4,
        loc_pdcd = $5,
        otl_pdnm = $6,
        otl_darp = $7,
        otl_adr1 = $8,
        otl_advl = $9,
        otl_addp = $10,
        otl_cgrp = $11,
        otl_caxe = $12,
        otl_cont = $13,
        otl_ntel = $14,
        loc_imel = $15,
        loc_hope = $16,
        loc_hclo = $17,
        otl_thay = $18,
        otl_tgr = $19,
        otl_ttco = $20,
        otl_ttpl = $21,
        otl_tbl = $22,
        otl_tbil = $23,
        otl_tchq = $24,
        otl_tttc = $25,
        act_devi = $26,
        otl_moda = $27,
        otl_mohe = $28,
        otl_moqi = $29
      WHERE otl_keyu = $30
      RETURNING *
    `;
    
    const updateValues = [
      exp_code || null,                  // $1
      exp_lib || null,                   // $2
      otl_poch || null,                  // $3
      otl_rfcl || null,                  // $4
      loc_pdcd || null,                  // $5
      otl_pdnm || null,                  // $6
      otl_darp || null,                  // $7
      otl_adr1 || null,                  // $8
      otl_advl || null,                  // $9
      otl_addp || null,                  // $10
      otl_cgrp || null,                  // $11
      otl_caxe || null,                  // $12
      otl_cont || null,                  // $13
      otl_ntel || null,                  // $14
      loc_imel || null,                  // $15
      loc_hope || null,                  // $16
      loc_hclo || null,                  // $17
      otl_thay || false,                 // $18
      otl_tgr || false,                  // $19
      otl_ttco || false,                 // $20
      otl_ttpl || false,                 // $21
      otl_tbl || false,                  // $22
      otl_tbil || false,                 // $23
      otl_tchq || false,                 // $24
      otl_tttc || null,                  // $25
      act_devi || null,                  // $26
      formattedDate,                     // $27
      formattedTime,                     // $28
      'FRONTEND',                        // $29
      id                                 // $30
    ];
    
    const result = await client.query(updateQuery, updateValues);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "CMD not found or cannot be updated"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "CMD updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating CMD:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


// ========================= UTILISATEUR ENDPOINTS =========================

// GET all utilisateurs
app.get("/utilisateur", async (req, res) => {
  const q = "SELECT * FROM USR_DAT WHERE usr_stat != '099'";
  try {
    const result = await pool.query(q);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET specific utilisateur by ID
app.get("/utilisateur/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  try {
    const query = "SELECT * FROM USR_DAT WHERE usr_keyu = $1 AND usr_stat != '099'";
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Utilisateur not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching Utilisateur details:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// POST create new utilisateur
app.post("/utilisateur", async (req, res) => {
  const { 
    usr_actf,
    usr_name,
    usr_mtrc,
    usr_type,
    usr_lang,
    usr_limi,
    usr_mail,
    usr_logn,
    usr_pass
  } = req.body;
  
  // Validate required fields
  if (!usr_name || !usr_mtrc || !usr_type || !usr_lang || !usr_limi || !usr_mail || !usr_logn || !usr_pass) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: usr_name, usr_mtrc, usr_type, usr_lang, usr_limi, usr_mail, usr_logn, usr_pass" 
    });
  }

  // Validate field lengths
  if (usr_name.length > 50) {
    return res.status(400).json({ status: "error", message: "usr_name cannot exceed 50 characters" });
  }
  if (usr_mtrc.length > 50) {
    return res.status(400).json({ status: "error", message: "usr_mtrc cannot exceed 50 characters" });
  }
  if (usr_type.length > 50) {
    return res.status(400).json({ status: "error", message: "usr_type cannot exceed 50 characters" });
  }
  if (usr_lang.length > 50) {
    return res.status(400).json({ status: "error", message: "usr_lang cannot exceed 50 characters" });
  }
  if (usr_mail.length > 128) {
    return res.status(400).json({ status: "error", message: "usr_mail cannot exceed 128 characters" });
  }
  if (usr_logn.length > 20) {
    return res.status(400).json({ status: "error", message: "usr_logn cannot exceed 20 characters" });
  }
  if (usr_pass.length > 100) {
    return res.status(400).json({ status: "error", message: "usr_pass cannot exceed 100 characters" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(usr_mail)) {
    return res.status(400).json({ status: "error", message: "Invalid email format" });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if login already exists
    const checkLoginQuery = "SELECT usr_keyu FROM USR_DAT WHERE usr_logn = $1 AND usr_stat != '099'";
    const loginCheck = await client.query(checkLoginQuery, [usr_logn]);
    
    if (loginCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: "error",
        message: "Identifiant de connexion déjà utilisé"
      });
    }
    
    // Get the max usr_keyu to increment
    const maxKeyuQuery = "SELECT COALESCE(MAX(usr_keyu), 3000) as max_keyu FROM USR_DAT";
    const keyuResult = await client.query(maxKeyuQuery);
    const nextKeyu = parseInt(keyuResult.rows[0].max_keyu) + 1;
    
    // Get current timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds;
    
    // Insert the new utilisateur
    const insertQuery = `
      INSERT INTO USR_DAT (
        usr_keyu, usr_actf, usr_name, usr_mtrc, usr_type, usr_lang, 
        usr_limi, usr_mail, usr_logn, usr_pass, usr_stat,
        usr_crda, usr_crhe, usr_crqi
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const insertValues = [
      nextKeyu,
      usr_actf !== undefined ? usr_actf : true, // Default to true if not provided
      usr_name,
      usr_mtrc,
      usr_type,
      usr_lang,
      usr_limi,
      usr_mail,
      usr_logn,
      usr_pass,
      '020', // Active status
      formattedDate,
      formattedTime,
      'FRONTEND'
    ];
    
    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');
    
    res.status(201).json({
      status: "success",
      message: "Utilisateur created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating Utilisateur:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// PUT update utilisateur
app.put("/utilisateur/:id", async (req, res) => {
  const id = req.params.id;
  const { 
    usr_actf,
    usr_name,
    usr_mtrc,
    usr_type,
    usr_lang,
    usr_limi,
    usr_mail,
    usr_logn,
    usr_pass
  } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  if (!usr_name || !usr_mtrc || !usr_type || !usr_lang || !usr_limi || !usr_mail || !usr_logn || !usr_pass) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields" 
    });
  }

  // Validate field lengths
  if (usr_name.length > 50 || usr_mtrc.length > 50 || usr_type.length > 50 || 
      usr_lang.length > 50 || usr_mail.length > 128 || usr_logn.length > 20 || usr_pass.length > 100) {
    return res.status(400).json({ 
      status: "error", 
      message: "One or more fields exceed maximum length" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(usr_mail)) {
    return res.status(400).json({ status: "error", message: "Invalid email format" });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if login already exists for other users
    const checkLoginQuery = "SELECT usr_keyu FROM USR_DAT WHERE usr_logn = $1 AND usr_keyu != $2 AND usr_stat != '099'";
    const loginCheck = await client.query(checkLoginQuery, [usr_logn, id]);
    
    if (loginCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: "error",
        message: "Identifiant de connexion déjà utilisé par un autre utilisateur"
      });
    }
    
    // Get current timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds;
    
    // Update the utilisateur record
    const updateQuery = `
      UPDATE USR_DAT 
      SET 
        usr_actf = $1,
        usr_name = $2,
        usr_mtrc = $3,
        usr_type = $4,
        usr_lang = $5,
        usr_limi = $6,
        usr_mail = $7,
        usr_logn = $8,
        usr_pass = $9,
        usr_moda = $10,
        usr_mohe = $11,
        usr_moqi = $12
      WHERE usr_keyu = $13
      RETURNING *
    `;
    
    const updateValues = [
      usr_actf !== undefined ? usr_actf : true, // Default to true if not provided
      usr_name,
      usr_mtrc,
      usr_type,
      usr_lang,
      usr_limi,
      usr_mail,
      usr_logn,
      usr_pass,
      formattedDate,
      formattedTime,
      'FRONTEND',
      id
    ];
    
    const result = await client.query(updateQuery, updateValues);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "Utilisateur not found or cannot be updated"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "Utilisateur updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating Utilisateur:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE Multiple Utilisateurs (Archive by setting status to '099')
app.delete("/utilisateur", async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or invalid required parameter: ids" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update Utilisateur status to '099' (archived)
    const updateQuery = `
      UPDATE USR_DAT 
      SET usr_stat = '099' 
      WHERE usr_keyu = ANY($1)
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [ids]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No utilisateurs found with provided IDs"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${result.rowCount} utilisateurs archived successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving utilisateurs:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


// ========================= LOCATION ENDPOINTS =========================

// GET all locations
app.get("/location", async (req, res) => {
  const q = "SELECT * FROM LOC_DAT WHERE loc_stat != '099'";
  try {
    const result = await pool.query(q);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET specific location by ID
app.get("/location/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  try {
    const query = "SELECT * FROM LOC_DAT WHERE loc_keyu = $1 AND loc_stat != '099'";
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Location not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching Location details:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// POST create new location
app.post("/location", async (req, res) => {
  const { 
    loc_pdcd,
    loc_pdnm,
    loc_adr1,
    loc_adr2,
    loc_adr3,
    loc_adr4,
    loc_ntel,
    loc_fax,
    loc_imel,
    loc_advl,
    loc_addp,
    loc_adcp,
    loc_geoc,
    loc_cont,
    loc_cpay,
    loc_hope,
    loc_hclo
  } = req.body;
  
  // Validate required fields
  if (!loc_pdcd || !loc_pdnm || !loc_adr1 || !loc_advl || !loc_adcp) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: loc_pdcd, loc_pdnm, loc_adr1, loc_advl, loc_adcp" 
    });
  }

  // Validate field lengths
  if (loc_pdcd.length > 50) return res.status(400).json({ status: "error", message: "loc_pdcd cannot exceed 50 characters" });
  if (loc_pdnm.length > 50) return res.status(400).json({ status: "error", message: "loc_pdnm cannot exceed 50 characters" });
  if (loc_adr1.length > 250) return res.status(400).json({ status: "error", message: "loc_adr1 cannot exceed 250 characters" });
  if (loc_adr2 && loc_adr2.length > 250) return res.status(400).json({ status: "error", message: "loc_adr2 cannot exceed 250 characters" });
  if (loc_adr3 && loc_adr3.length > 50) return res.status(400).json({ status: "error", message: "loc_adr3 cannot exceed 50 characters" });
  if (loc_adr4 && loc_adr4.length > 50) return res.status(400).json({ status: "error", message: "loc_adr4 cannot exceed 50 characters" });
  if (loc_ntel && loc_ntel.length > 15) return res.status(400).json({ status: "error", message: "loc_ntel cannot exceed 15 characters" });
  if (loc_fax && loc_fax.length > 20) return res.status(400).json({ status: "error", message: "loc_fax cannot exceed 20 characters" });
  if (loc_imel && loc_imel.length > 100) return res.status(400).json({ status: "error", message: "loc_imel cannot exceed 100 characters" });
  if (loc_advl.length > 25) return res.status(400).json({ status: "error", message: "loc_advl cannot exceed 25 characters" });
  if (loc_addp && loc_addp.length > 5) return res.status(400).json({ status: "error", message: "loc_addp cannot exceed 5 characters" });
  if (loc_adcp.length > 15) return res.status(400).json({ status: "error", message: "loc_adcp cannot exceed 15 characters" });
  if (loc_geoc && loc_geoc.length > 15) return res.status(400).json({ status: "error", message: "loc_geoc cannot exceed 15 characters" });
  if (loc_cont && loc_cont.length > 150) return res.status(400).json({ status: "error", message: "loc_cont cannot exceed 150 characters" });
  if (loc_cpay && loc_cpay.length > 6) return res.status(400).json({ status: "error", message: "loc_cpay cannot exceed 6 characters" });

  // Validate email format if provided
  if (loc_imel) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loc_imel)) {
      return res.status(400).json({ status: "error", message: "Invalid email format" });
    }
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if location code already exists
    const checkCodeQuery = "SELECT loc_keyu FROM LOC_DAT WHERE loc_pdcd = $1 AND loc_stat != '099'";
    const codeCheck = await client.query(checkCodeQuery, [loc_pdcd]);
    
    if (codeCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: "error",
        message: "Code point de livraison déjà utilisé"
      });
    }
    
    // Get the max loc_keyu to increment
    const maxKeyuQuery = "SELECT COALESCE(MAX(loc_keyu), 4000) as max_keyu FROM LOC_DAT";
    const keyuResult = await client.query(maxKeyuQuery);
    const nextKeyu = parseInt(keyuResult.rows[0].max_keyu) + 1;
    
    // Get current timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds;
    
    // Insert the new location
    const insertQuery = `
      INSERT INTO LOC_DAT (
        loc_keyu, loc_pdcd, loc_pdnm, loc_adr1, loc_adr2, loc_adr3, loc_adr4,
        loc_ntel, loc_fax, loc_imel, loc_advl, loc_addp, loc_adcp, loc_geoc,
        loc_cont, loc_cpay, loc_hope, loc_hclo, loc_stat,
        loc_crda, loc_crhe, loc_crqi
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22
      )
      RETURNING *
    `;
    
    const insertValues = [
      nextKeyu,                    // $1
      loc_pdcd,                    // $2
      loc_pdnm,                    // $3
      loc_adr1,                    // $4
      loc_adr2 || null,            // $5
      loc_adr3 || null,            // $6
      loc_adr4 || null,            // $7
      loc_ntel || null,            // $8
      loc_fax || null,             // $9
      loc_imel || null,            // $10
      loc_advl,                    // $11
      loc_addp || null,            // $12
      loc_adcp,                    // $13
      loc_geoc || null,            // $14
      loc_cont || null,            // $15
      loc_cpay || null,            // $16
      loc_hope || null,            // $17
      loc_hclo || null,            // $18
      '020',                       // $19 - Active status
      formattedDate,               // $20
      formattedTime,               // $21
      'FRONTEND'                   // $22
    ];
    
    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');
    
    res.status(201).json({
      status: "success",
      message: "Location created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating Location:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// PUT update location
app.put("/location/:id", async (req, res) => {
  const id = req.params.id;
  const { 
    loc_pdcd,
    loc_pdnm,
    loc_adr1,
    loc_adr2,
    loc_adr3,
    loc_adr4,
    loc_ntel,
    loc_fax,
    loc_imel,
    loc_advl,
    loc_addp,
    loc_adcp,
    loc_geoc,
    loc_cont,
    loc_cpay,
    loc_hope,
    loc_hclo
  } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  if (!loc_pdcd || !loc_pdnm || !loc_adr1 || !loc_advl || !loc_adcp) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields" 
    });
  }

  // Validate field lengths (same as POST)
  if (loc_pdcd.length > 50 || loc_pdnm.length > 50 || loc_adr1.length > 250 || 
      loc_advl.length > 25 || loc_adcp.length > 15) {
    return res.status(400).json({ 
      status: "error", 
      message: "One or more fields exceed maximum length" 
    });
  }

  // Validate email format if provided
  if (loc_imel) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loc_imel)) {
      return res.status(400).json({ status: "error", message: "Invalid email format" });
    }
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if location code already exists for other locations
    const checkCodeQuery = "SELECT loc_keyu FROM LOC_DAT WHERE loc_pdcd = $1 AND loc_keyu != $2 AND loc_stat != '099'";
    const codeCheck = await client.query(checkCodeQuery, [loc_pdcd, id]);
    
    if (codeCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: "error",
        message: "Code point de livraison déjà utilisé par une autre localisation"
      });
    }
    
    // Get current timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds;
    
    // Update the location record
    const updateQuery = `
      UPDATE LOC_DAT 
      SET 
        loc_pdcd = $1,
        loc_pdnm = $2,
        loc_adr1 = $3,
        loc_adr2 = $4,
        loc_adr3 = $5,
        loc_adr4 = $6,
        loc_ntel = $7,
        loc_fax = $8,
        loc_imel = $9,
        loc_advl = $10,
        loc_addp = $11,
        loc_adcp = $12,
        loc_geoc = $13,
        loc_cont = $14,
        loc_cpay = $15,
        loc_hope = $16,
        loc_hclo = $17,
        loc_moda = $18,
        loc_mohe = $19,
        loc_moqi = $20
      WHERE loc_keyu = $21
      RETURNING *
    `;
    
    const updateValues = [
      loc_pdcd,                    // $1
      loc_pdnm,                    // $2
      loc_adr1,                    // $3
      loc_adr2 || null,            // $4
      loc_adr3 || null,            // $5
      loc_adr4 || null,            // $6
      loc_ntel || null,            // $7
      loc_fax || null,             // $8
      loc_imel || null,            // $9
      loc_advl,                    // $10
      loc_addp || null,            // $11
      loc_adcp,                    // $12
      loc_geoc || null,            // $13
      loc_cont || null,            // $14
      loc_cpay || null,            // $15
      loc_hope || null,            // $16
      loc_hclo || null,            // $17
      formattedDate,               // $18
      formattedTime,               // $19
      'FRONTEND',                  // $20
      id                           // $21
    ];
    
    const result = await client.query(updateQuery, updateValues);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "Location not found or cannot be updated"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "Location updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating Location:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE Multiple Locations (Archive by setting status to '099')
app.delete("/location", async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or invalid required parameter: ids" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update Location status to '099' (archived)
    const updateQuery = `
      UPDATE LOC_DAT 
      SET loc_stat = '099' 
      WHERE loc_keyu = ANY($1)
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [ids]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No locations found with provided IDs"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${result.rowCount} locations archived successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving locations:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

app.listen(8800, ()=>{
  console.log("Connected to backend!")
})